import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LocalOcrExtraction } from "../components/local-ocr-extraction";

const ocrResult = {
  mode: "local-synthetic-ocr",
  data_notice: "synthetic-demo-only",
  processing_notice:
    "OCR transcription only; unverified and not clinical advice. This local demo does not save the uploaded PDF or call an AI service.",
  page_count: 1,
  pages: [
    {
      page_number: 1,
      status: "text-detected",
      text: "SYNTHETIC DEMO",
      average_word_confidence: 95,
      words: [
        {
          text: "SYNTHETIC",
          confidence: 95,
          source_bounds: { x: 0.1, y: 0.2, width: 0.3, height: 0.05 },
        },
      ],
      preview_data_url: "data:image/jpeg;base64,c3ludGhldGlj",
      preview_width: 900,
      preview_height: 1165,
    },
  ],
};

function response(payload: unknown, ok = true) {
  return {
    ok,
    json: vi.fn().mockResolvedValue(payload),
  } as unknown as Response;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("local synthetic OCR extraction", () => {
  it("requires a synthetic PDF confirmation and displays source-linked OCR", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response(ocrResult));
    vi.stubGlobal("fetch", fetchMock);
    render(<LocalOcrExtraction />);

    const file = new File(["%PDF-1.7 synthetic"], "synthetic.pdf", {
      type: "application/pdf",
    });
    fireEvent.change(screen.getByLabelText(/choose a synthetic pdf/i), {
      target: { files: [file] },
    });

    const submit = screen.getByRole("button", { name: "Transcribe locally" });
    expect(submit).toBeDisabled();
    fireEvent.click(
      screen.getByRole("checkbox", {
        name: /fictional test document and contains no real patient/i,
      }),
    );
    expect(submit).toBeEnabled();
    fireEvent.click(submit);

    expect(
      await screen.findByRole("heading", { name: "Source page 1" }),
    ).toBeInTheDocument();
    expect(screen.getByText("SYNTHETIC DEMO")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Original synthetic report, page 1" }),
    ).toBeInTheDocument();
    const wordOverlay = document.querySelector(".local-ocr-word-overlay");
    expect(wordOverlay).toHaveStyle({
      left: "10%",
      top: "20%",
      width: "30%",
      height: "5%",
    });
    expect(
      screen.getByText(/does not save the uploaded PDF/i),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(url).toBe("http://127.0.0.1:8765/api/v1/demo/ocr");
    expect(options.method).toBe("POST");
    expect(options.cache).toBe("no-store");
    expect(options.body).toBeInstanceOf(FormData);
    expect((options.body as FormData).get("synthetic_confirmation")).toBe("true");
  });

  it("does not submit a PDF larger than the local limit", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<LocalOcrExtraction />);

    const file = new File([new Uint8Array(10 * 1024 * 1024 + 1)], "large.pdf", {
      type: "application/pdf",
    });
    fireEvent.change(screen.getByLabelText(/choose a synthetic pdf/i), {
      target: { files: [file] },
    });
    fireEvent.click(
      screen.getByRole("checkbox", {
        name: /fictional test document and contains no real patient/i,
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Transcribe locally" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The PDF must be 10 MB or smaller.",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
