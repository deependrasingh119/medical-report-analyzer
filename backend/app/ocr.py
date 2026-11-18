import base64
import csv
import io
import ipaddress
import os
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Literal

import fitz
from fastapi import (
    APIRouter,
    File,
    Form,
    HTTPException,
    Request,
    UploadFile,
    status,
)
from pydantic import BaseModel

MAX_UPLOAD_BYTES = 10 * 1024 * 1024
MAX_PAGES = 20
MAX_PAGE_DIMENSION_POINTS = 1440
MAX_OCR_RENDER_EDGE = 2500
MAX_PREVIEW_EDGE = 900
MAX_PREVIEW_BYTES = 8 * 1024 * 1024
TESSERACT_TIMEOUT_SECONDS = 20

router = APIRouter(tags=["local-synthetic-ocr"])


class BoundingBox(BaseModel):
    x: float
    y: float
    width: float
    height: float


class OcrWord(BaseModel):
    text: str
    confidence: float | None
    source_bounds: BoundingBox


class OcrPage(BaseModel):
    page_number: int
    status: Literal["text-detected", "no-text-detected"]
    text: str
    average_word_confidence: float | None
    words: list[OcrWord]
    preview_data_url: str
    preview_width: int
    preview_height: int


class LocalOcrResult(BaseModel):
    mode: Literal["local-synthetic-ocr"]
    data_notice: Literal["synthetic-demo-only"]
    processing_notice: str
    page_count: int
    pages: list[OcrPage]


def _tesseract_tsv(image_png: bytes) -> str:
    if shutil.which("tesseract") is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Local Tesseract OCR is not installed or is not available on "
                "the backend PATH."
            ),
        )

    try:
        result = subprocess.run(
            [
                "tesseract",
                "stdin",
                "stdout",
                "--psm",
                "6",
                "-l",
                "eng",
                "tsv",
            ],
            input=image_png,
            capture_output=True,
            timeout=TESSERACT_TIMEOUT_SECONDS,
            check=False,
        )
    except subprocess.TimeoutExpired as error:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="OCR timed out while processing a page.",
        ) from error
    except OSError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The local OCR process could not be started.",
        ) from error

    if result.returncode != 0:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Local OCR could not process a page.",
        )

    return result.stdout.decode("utf-8", errors="replace")


def _parse_tesseract_tsv(
    tsv: str,
    image_width: int,
    image_height: int,
) -> tuple[str, list[OcrWord], float | None]:
    reader = csv.DictReader(io.StringIO(tsv), delimiter="\t")
    words: list[OcrWord] = []
    lines: dict[tuple[str, str, str, str], list[str]] = {}
    confidences: list[float] = []

    try:
        for row in reader:
            if row["level"] != "5":
                continue

            text = row["text"].strip()
            if not text:
                continue

            confidence_value = float(row["conf"])
            confidence = round(confidence_value, 2) if confidence_value >= 0 else None
            if confidence is not None:
                confidences.append(confidence)

            left = int(row["left"])
            top = int(row["top"])
            width = int(row["width"])
            height = int(row["height"])
            words.append(
                OcrWord(
                    text=text,
                    confidence=confidence,
                    source_bounds=BoundingBox(
                        x=max(0.0, min(1.0, left / image_width)),
                        y=max(0.0, min(1.0, top / image_height)),
                        width=max(0.0, min(1.0, width / image_width)),
                        height=max(0.0, min(1.0, height / image_height)),
                    ),
                )
            )
            line_key = (
                row["block_num"],
                row["par_num"],
                row["line_num"],
                row["page_num"],
            )
            lines.setdefault(line_key, []).append(text)
    except (KeyError, ValueError, ZeroDivisionError) as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Local OCR returned an invalid response.",
        ) from error

    text = "\n".join(" ".join(line_words) for line_words in lines.values())
    average_confidence = (
        round(sum(confidences) / len(confidences), 2) if confidences else None
    )
    return text, words, average_confidence


def _render_page_preview(
    page: fitz.Page,
) -> tuple[bytes, int, int, bytes, int, int]:
    rectangle = page.rect
    if (
        rectangle.width <= 0
        or rectangle.height <= 0
        or rectangle.width > MAX_PAGE_DIMENSION_POINTS
        or rectangle.height > MAX_PAGE_DIMENSION_POINTS
    ):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="A PDF page has unsupported dimensions.",
        )

    scale = min(200 / 72, MAX_OCR_RENDER_EDGE / max(rectangle.width, rectangle.height))
    ocr_pixmap = page.get_pixmap(
        matrix=fitz.Matrix(scale, scale),
        alpha=False,
    )
    preview_scale = min(
        1.0,
        MAX_PREVIEW_EDGE / max(rectangle.width, rectangle.height),
    )
    preview_pixmap = page.get_pixmap(
        matrix=fitz.Matrix(preview_scale, preview_scale),
        alpha=False,
    )
    return (
        ocr_pixmap.tobytes("png"),
        ocr_pixmap.width,
        ocr_pixmap.height,
        preview_pixmap.tobytes("jpg", jpg_quality=55),
        preview_pixmap.width,
        preview_pixmap.height,
    )


async def extract_synthetic_pdf(
    upload: UploadFile,
    synthetic_confirmation: bool,
) -> LocalOcrResult:
    if not synthetic_confirmation:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Confirm that the file is fictional and contains no personal data.",
        )

    with tempfile.TemporaryDirectory(prefix="carelens-ocr-") as temp_dir:
        source_path = Path(temp_dir) / "report.pdf"
        total_bytes = 0
        header = b""

        with source_path.open("xb") as target:
            while chunk := await upload.read(64 * 1024):
                total_bytes += len(chunk)
                if total_bytes > MAX_UPLOAD_BYTES:
                    raise HTTPException(
                        status_code=status.HTTP_413_CONTENT_TOO_LARGE,
                        detail="The PDF must be 10 MB or smaller.",
                    )
                if len(header) < 5:
                    header += chunk[: 5 - len(header)]
                target.write(chunk)

        if total_bytes == 0 or not header.startswith(b"%PDF-"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Upload a valid PDF document.",
            )

        try:
            document = fitz.open(source_path)
        except (fitz.FileDataError, fitz.EmptyFileError) as error:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The uploaded document is not a readable PDF.",
            ) from error

        with document:
            if document.is_encrypted:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Encrypted PDFs are not supported.",
                )
            if document.page_count < 1:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="The PDF contains no pages.",
                )
            if document.page_count > MAX_PAGES:
                raise HTTPException(
                    status_code=status.HTTP_413_CONTENT_TOO_LARGE,
                    detail="The PDF must contain 20 pages or fewer.",
                )

            pages: list[OcrPage] = []
            total_preview_bytes = 0
            for page_index in range(document.page_count):
                page = document.load_page(page_index)
                (
                    ocr_png,
                    image_width,
                    image_height,
                    preview_jpeg,
                    preview_width,
                    preview_height,
                ) = _render_page_preview(page)
                total_preview_bytes += len(preview_jpeg)
                if total_preview_bytes > MAX_PREVIEW_BYTES:
                    raise HTTPException(
                        status_code=status.HTTP_413_CONTENT_TOO_LARGE,
                        detail=(
                            "The rendered previews are too large. Try a PDF "
                            "with fewer pages or smaller page dimensions."
                        ),
                    )

                tsv = _tesseract_tsv(ocr_png)
                text, words, average_confidence = _parse_tesseract_tsv(
                    tsv,
                    image_width,
                    image_height,
                )
                pages.append(
                    OcrPage(
                        page_number=page_index + 1,
                        status="text-detected" if text else "no-text-detected",
                        text=text,
                        average_word_confidence=average_confidence,
                        words=words,
                        preview_data_url=(
                            "data:image/jpeg;base64,"
                            + base64.b64encode(preview_jpeg).decode("ascii")
                        ),
                        preview_width=preview_width,
                        preview_height=preview_height,
                    )
                )

    return LocalOcrResult(
        mode="local-synthetic-ocr",
        data_notice="synthetic-demo-only",
        processing_notice=(
            "OCR transcription only; unverified and not clinical advice. "
            "This local demo does not save the uploaded PDF or call an AI service."
        ),
        page_count=len(pages),
        pages=pages,
    )


@router.post(
    "/demo/ocr",
    response_model=LocalOcrResult,
    summary="OCR a temporary synthetic PDF using local Tesseract",
    description=(
        "Local development demo only. Requires confirmation that the document "
        "is fictional and contains no personal data. The file is processed "
        "temporarily, is not persisted, and is not sent to an AI service."
    ),
)
async def ocr_synthetic_report(
    request: Request,
    file: UploadFile = File(...),
    synthetic_confirmation: bool = Form(...),
) -> LocalOcrResult:
    if os.environ.get("CARELEN_ENABLE_LOCAL_SYNTHETIC_OCR") != "1":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The local synthetic OCR demo is disabled.",
        )

    client = request.client
    try:
        is_loopback = (
            client is not None
            and ipaddress.ip_address(client.host).is_loopback
        )
    except ValueError:
        is_loopback = False

    if not is_loopback:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The local synthetic OCR demo only accepts loopback requests.",
        )

    return await extract_synthetic_pdf(file, synthetic_confirmation)
