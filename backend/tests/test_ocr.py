import asyncio
from pathlib import Path

import fitz
import httpx
import pytest

from backend.app import ocr
from backend.app.main import app

_TESSERACT_TSV = (
    "level\tpage_num\tblock_num\tpar_num\tline_num\tword_num\tleft\ttop"
    "\twidth\theight\tconf\ttext\n"
    "5\t1\t1\t1\t1\t1\t20\t30\t100\t24\t96.5\tSYNTHETIC\n"
    "5\t1\t1\t1\t1\t2\t130\t30\t80\t24\t91.0\tDEMO\n"
)


def _pdf_bytes(page_count: int = 1) -> bytes:
    document = fitz.open()
    for _ in range(page_count):
        document.new_page(width=612, height=792)
    content = document.tobytes()
    document.close()
    return content


async def _request(
    content: bytes,
    *,
    confirmation: str | None = "true",
    filename: str = "synthetic.pdf",
    client_host: str = "127.0.0.1",
) -> httpx.Response:
    transport = httpx.ASGITransport(app=app, client=(client_host, 12345))
    data = (
        {"synthetic_confirmation": confirmation}
        if confirmation is not None
        else None
    )
    async with httpx.AsyncClient(
        transport=transport,
        base_url="http://testserver",
    ) as client:
        return await client.post(
            "/api/v1/demo/ocr",
            data=data,
            files={"file": (filename, content, "application/pdf")},
        )


def request(
    content: bytes,
    *,
    confirmation: str | None = "true",
    filename: str = "synthetic.pdf",
    client_host: str = "127.0.0.1",
) -> httpx.Response:
    return asyncio.run(
        _request(
            content,
            confirmation=confirmation,
            filename=filename,
            client_host=client_host,
        )
    )


@pytest.fixture(autouse=True)
def enable_local_ocr_for_tests(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("CARELEN_ENABLE_LOCAL_SYNTHETIC_OCR", "1")


def test_ocr_transcribes_synthetic_pdf_with_page_provenance(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(ocr, "_tesseract_tsv", lambda _: _TESSERACT_TSV)

    response = request(_pdf_bytes())

    assert response.status_code == 200
    body = response.json()
    assert body["mode"] == "local-synthetic-ocr"
    assert body["data_notice"] == "synthetic-demo-only"
    assert body["page_count"] == 1
    page = body["pages"][0]
    assert page["page_number"] == 1
    assert page["status"] == "text-detected"
    assert page["text"] == "SYNTHETIC DEMO"
    assert page["average_word_confidence"] == 93.75
    assert page["words"][0]["source_bounds"] == {
        "x": pytest.approx(20 / 1700),
        "y": pytest.approx(30 / 2200),
        "width": pytest.approx(100 / 1700),
        "height": pytest.approx(24 / 2200),
    }
    assert page["preview_data_url"].startswith("data:image/jpeg;base64,")
    assert page["preview_width"] == 612
    assert page["preview_height"] == 792
    assert "does not save" in body["processing_notice"]


def test_ocr_requires_explicit_synthetic_confirmation() -> None:
    response = request(_pdf_bytes(), confirmation="false")

    assert response.status_code == 400
    assert "fictional" in response.json()["detail"]


def test_ocr_requires_confirmation_field() -> None:
    response = request(_pdf_bytes(), confirmation=None)

    assert response.status_code == 422


def test_ocr_rejects_non_pdf_without_echoing_filename() -> None:
    filename = "private-report-marker.pdf"
    response = request(b"not a pdf", filename=filename)

    assert response.status_code == 400
    assert "valid PDF" in response.json()["detail"]
    assert filename not in response.text


def test_ocr_rejects_non_loopback_clients() -> None:
    response = request(_pdf_bytes(), client_host="203.0.113.10")

    assert response.status_code == 403
    assert "loopback" in response.json()["detail"]


def test_ocr_rejects_malformed_pdf_with_clear_error() -> None:
    response = request(b"%PDF-1.7\nnot a real PDF")

    assert response.status_code == 400
    assert "readable PDF" in response.json()["detail"]


def test_ocr_rejects_upload_over_ten_megabytes() -> None:
    response = request(b"%PDF-" + b"0" * (ocr.MAX_UPLOAD_BYTES + 1))

    assert response.status_code == 413
    assert "10 MB" in response.json()["detail"]


def test_ocr_rejects_more_than_twenty_pages() -> None:
    response = request(_pdf_bytes(page_count=21))

    assert response.status_code == 413
    assert "20 pages" in response.json()["detail"]


def test_ocr_reports_missing_local_tesseract(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(ocr.shutil, "which", lambda _: None)

    response = request(_pdf_bytes())

    assert response.status_code == 503
    assert "Tesseract" in response.json()["detail"]


def test_ocr_handles_pages_with_no_detected_text(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(
        ocr,
        "_tesseract_tsv",
        lambda _: (
            "level\tpage_num\tblock_num\tpar_num\tline_num\tword_num\tleft\t"
            "top\twidth\theight\tconf\ttext\n"
        ),
    )

    response = request(_pdf_bytes())

    assert response.status_code == 200
    page = response.json()["pages"][0]
    assert page["status"] == "no-text-detected"
    assert page["text"] == ""
    assert page["average_word_confidence"] is None


def test_uploaded_pdf_is_removed_after_processing(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    monkeypatch.setattr(ocr.tempfile, "tempdir", str(tmp_path))
    monkeypatch.setattr(ocr, "_tesseract_tsv", lambda _: _TESSERACT_TSV)

    response = request(_pdf_bytes())

    assert response.status_code == 200
    assert list(tmp_path.iterdir()) == []


def test_ocr_is_disabled_without_explicit_environment_opt_in(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.delenv("CARELEN_ENABLE_LOCAL_SYNTHETIC_OCR")

    response = request(_pdf_bytes())

    assert response.status_code == 404
    assert "disabled" in response.json()["detail"]
