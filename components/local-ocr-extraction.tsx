"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, FileText } from "lucide-react";
import Image from "next/image";

type OcrWord = {
  text: string;
  confidence: number | null;
  source_bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

type OcrPage = {
  page_number: number;
  status: "text-detected" | "no-text-detected";
  text: string;
  average_word_confidence: number | null;
  words: OcrWord[];
  preview_data_url: string;
  preview_width: number;
  preview_height: number;
};

type LocalOcrResult = {
  mode: "local-synthetic-ocr";
  data_notice: "synthetic-demo-only";
  processing_notice: string;
  page_count: number;
  pages: OcrPage[];
};

const CONFIGURED_API_BASE_URL =
  process.env.NEXT_PUBLIC_CARELENS_API_URL || "http://127.0.0.1:8765";
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

function localApiBaseUrl(): string | null {
  try {
    const url = new URL(CONFIGURED_API_BASE_URL);
    if (
      !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
      !["http:", "https:"].includes(url.protocol)
    ) {
      return null;
    }

    return `${url.origin}${url.pathname}`.replace(/\/+$/, "");
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isOcrWord(value: unknown): value is OcrWord {
  if (!isRecord(value) || !isRecord(value.source_bounds)) {
    return false;
  }

  return (
    typeof value.text === "string" &&
    (typeof value.confidence === "number" || value.confidence === null) &&
    typeof value.source_bounds.x === "number" &&
    typeof value.source_bounds.y === "number" &&
    typeof value.source_bounds.width === "number" &&
    typeof value.source_bounds.height === "number"
  );
}

function isOcrPage(value: unknown): value is OcrPage {
  return (
    isRecord(value) &&
    typeof value.page_number === "number" &&
    (value.status === "text-detected" ||
      value.status === "no-text-detected") &&
    typeof value.text === "string" &&
    (typeof value.average_word_confidence === "number" ||
      value.average_word_confidence === null) &&
    Array.isArray(value.words) &&
    value.words.every(isOcrWord) &&
    typeof value.preview_data_url === "string" &&
    value.preview_data_url.startsWith("data:image/jpeg;base64,") &&
    typeof value.preview_width === "number" &&
    typeof value.preview_height === "number"
  );
}

function isLocalOcrResult(value: unknown): value is LocalOcrResult {
  return (
    isRecord(value) &&
    value.mode === "local-synthetic-ocr" &&
    value.data_notice === "synthetic-demo-only" &&
    typeof value.processing_notice === "string" &&
    typeof value.page_count === "number" &&
    Array.isArray(value.pages) &&
    value.pages.length === value.page_count &&
    value.pages.every(isOcrPage)
  );
}

function errorMessage(value: unknown): string {
  return value instanceof Error
    ? value.message
    : "The local OCR request could not be completed.";
}

export function LocalOcrExtraction() {
  const [file, setFile] = useState<File | null>(null);
  const [syntheticConfirmed, setSyntheticConfirmed] = useState(false);
  const [result, setResult] = useState<LocalOcrResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!file) {
      setError("Choose a PDF document first.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError("The PDF must be 10 MB or smaller.");
      return;
    }
    if (!syntheticConfirmed) {
      setError("Confirm that the file is fictional and contains no personal data.");
      return;
    }

    const apiBaseUrl = localApiBaseUrl();
    if (!apiBaseUrl) {
      setError(
        "Local OCR is restricted to a backend on this computer. The configured API address is not local.",
      );
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("synthetic_confirmation", "true");
    setIsProcessing(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/demo/ocr`, {
        method: "POST",
        body: formData,
        cache: "no-store",
      });
      const payload: unknown = await response.json();

      if (!response.ok) {
        const detail =
          isRecord(payload) && typeof payload.detail === "string"
            ? payload.detail
            : "The local OCR request was not successful.";
        throw new Error(detail);
      }
      if (!isLocalOcrResult(payload)) {
        throw new Error("The OCR service returned an unexpected response.");
      }

      setResult(payload);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <section
      className="secondary-view local-ocr"
      aria-labelledby="local-ocr-title"
    >
      <p className="eyebrow">LOCAL OCR DEVELOPMENT DEMO</p>
      <h1 id="local-ocr-title">Read a synthetic lab-report scan</h1>
      <p className="local-ocr-intro">
        This development-only tool uses Tesseract installed on the local
        backend to transcribe scanned PDF pages. It does not interpret results,
        use generative AI, or save the uploaded file.
      </p>

      <aside
        className="safety-banner local-ocr-safety"
        role="note"
        aria-label="Synthetic data only warning"
      >
        <span className="safety-icon" aria-hidden="true">
          i
        </span>
        <p>
          <strong>Synthetic files only. Never upload real patient records.</strong>{" "}
          OCR may misread values. The output is unverified and is not for
          clinical use. This prototype has no production authentication or
          hosted data protections.
        </p>
      </aside>

      <form className="local-ocr-form" onSubmit={(event) => void handleSubmit(event)}>
        <label className="local-ocr-file-label" htmlFor="synthetic-pdf">
          <FileText size={20} aria-hidden="true" />
          <span>
            <strong>Choose a synthetic PDF</strong>
            <small>Scanned laboratory-result PDFs · up to 10 MB and 20 pages</small>
          </span>
        </label>
        <input
          id="synthetic-pdf"
          className="local-ocr-file-input"
          type="file"
          accept="application/pdf,.pdf"
          onChange={(event) => {
            setFile(event.currentTarget.files?.[0] ?? null);
            setResult(null);
            setError(null);
          }}
        />
        {file && (
          <p className="local-ocr-selected-file">
            Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
          </p>
        )}

        <label className="local-ocr-confirmation">
          <input
            type="checkbox"
            checked={syntheticConfirmed}
            onChange={(event) => setSyntheticConfirmed(event.currentTarget.checked)}
          />
          <span>
            I confirm this is a fictional test document and contains no real
            patient or personal information.
          </span>
        </label>

        <button
          className="local-ocr-submit"
          type="submit"
          disabled={isProcessing || !file || !syntheticConfirmed}
        >
          {isProcessing ? "Transcribing pages…" : "Transcribe locally"}
        </button>
      </form>

      {isProcessing && (
        <p className="local-ocr-status" role="status">
          Processing locally. This may take a little while for multi-page PDFs.
        </p>
      )}

      {error && (
        <div className="local-ocr-error" role="alert">
          <AlertCircle size={19} aria-hidden="true" />
          <p>{error}</p>
        </div>
      )}

      {result && (
        <section
          className="local-ocr-results"
          aria-labelledby="ocr-results-title"
        >
          <h2 id="ocr-results-title">Unverified OCR transcription</h2>
          <p className="local-ocr-result-notice">{result.processing_notice}</p>
          {result.pages.map((page) => (
            <article
              className="local-ocr-page"
              key={page.page_number}
              aria-labelledby={`ocr-page-${page.page_number}`}
            >
              <h3 id={`ocr-page-${page.page_number}`}>
                Source page {page.page_number}
              </h3>
              <div className="local-ocr-page-grid">
                <figure className="local-ocr-preview">
                  <div className="local-ocr-image-frame">
                    <Image
                      src={page.preview_data_url}
                      alt={`Original synthetic report, page ${page.page_number}`}
                      width={page.preview_width}
                      height={page.preview_height}
                      unoptimized
                    />
                    {page.words.map((word, index) => (
                      <span
                        key={`${word.text}-${index}`}
                        className="local-ocr-word-overlay"
                        style={{
                          left: `${word.source_bounds.x * 100}%`,
                          top: `${word.source_bounds.y * 100}%`,
                          width: `${word.source_bounds.width * 100}%`,
                          height: `${word.source_bounds.height * 100}%`,
                        }}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <figcaption>Temporary page preview</figcaption>
                </figure>
                <div className="local-ocr-transcription">
                  <p>
                    {page.status === "text-detected"
                      ? `${page.words.length} words detected`
                      : "No text detected; verify this page manually."}
                    {page.average_word_confidence !== null &&
                      ` · Mean OCR confidence ${page.average_word_confidence}%`}
                  </p>
                  {page.text ? (
                    <pre>{page.text}</pre>
                  ) : (
                    <p className="local-ocr-no-text">
                      OCR did not return readable text for this page.
                    </p>
                  )}
                  {page.words.length > 0 && (
                    <details>
                      <summary>Show source positions for OCR words</summary>
                      <ul className="local-ocr-word-list">
                        {page.words.map((word, index) => (
                          <li key={`${word.text}-${index}`}>
                            <span>{word.text}</span>
                            <span>
                              x {word.source_bounds.x.toFixed(3)}, y{" "}
                              {word.source_bounds.y.toFixed(3)}, width{" "}
                              {word.source_bounds.width.toFixed(3)}, height{" "}
                              {word.source_bounds.height.toFixed(3)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </section>
  );
}
