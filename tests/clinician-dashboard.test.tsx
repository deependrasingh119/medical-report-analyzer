import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ClinicianDashboard } from "../components/clinician-dashboard";

const syntheticCases = {
  mode: "synthetic-demo",
  data_label: "fictional synthetic cases",
  read_only: true,
  cases: [
    {
      case_id: "synthetic-case-001",
      title: "Example visit-preparation summary A",
      data_label: "fictional synthetic case",
      prepared_summary:
        "A fictional demo patient prepared a short summary to discuss during a clinician visit.",
      prepared_questions: [
        "Which parts of my visit-preparation notes should we review together?",
        "What additional context would help explain these fictional examples?",
      ],
      clinician_review_context: true,
    },
    {
      case_id: "synthetic-case-002",
      title: "Example visit-preparation summary B",
      data_label: "fictional synthetic case",
      prepared_summary:
        "A second fictional demo patient organized questions for a conversation with a qualified clinician.",
      prepared_questions: [
        "How should I organize questions for a future clinician visit?",
        "Which details should I clarify with a qualified clinician?",
      ],
      clinician_review_context: true,
    },
  ],
};

const syntheticCaseDetail = {
  mode: "synthetic-demo",
  read_only: true,
  case: syntheticCases.cases[0],
  safety_notice:
    "Synthetic demo only; these fictional preparation notes are not a diagnosis, triage, or treatment recommendation. A qualified clinician must review real health information.",
};

function response(
  payload: unknown,
  ok = true,
  status = ok ? 200 : 403,
) {
  return {
    ok,
    status,
    json: vi.fn().mockResolvedValue(payload),
  } as unknown as Response;
}

describe("clinician synthetic case review", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads the fixed list and detail using the backend demo-role GET contract", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response(syntheticCases))
      .mockResolvedValueOnce(response(syntheticCaseDetail));
    vi.stubGlobal("fetch", fetchMock);

    render(<ClinicianDashboard />);

    expect(await screen.findByText("Example visit-preparation summary A")).toBeInTheDocument();
    expect(
      await screen.findByText(
        "Which parts of my visit-preparation notes should we review together?",
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByText("fictional synthetic case")).toHaveLength(3);
    expect(screen.getByText("Clinician review required")).toBeInTheDocument();
    expect(screen.getByText(/not production authentication/i)).toBeInTheDocument();
    expect(
      screen.getAllByText(/production authentication is disabled/i),
    ).toHaveLength(1);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(document.querySelector('input[type="file"]')).not.toBeInTheDocument();

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "http://127.0.0.1:8765/api/v1/demo/clinician/cases",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "X-Demo-Role": "clinician",
        },
        cache: "no-store",
      },
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://127.0.0.1:8765/api/v1/demo/clinician/cases/synthetic-case-001",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "X-Demo-Role": "clinician",
        },
        cache: "no-store",
      },
    );
    expect(fetchMock.mock.calls[0][1]).not.toHaveProperty("body");
    expect(fetchMock.mock.calls[1][1]).not.toHaveProperty("body");
  });

  it("loads the selected fixed case detail when a clinician chooses another example", async () => {
    const secondCaseDetail = {
      ...syntheticCaseDetail,
      case: syntheticCases.cases[1],
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response(syntheticCases))
      .mockResolvedValueOnce(response(syntheticCaseDetail))
      .mockResolvedValueOnce(response(secondCaseDetail));
    vi.stubGlobal("fetch", fetchMock);

    render(<ClinicianDashboard />);

    const secondCaseButton = await screen.findByRole("button", {
      name: /Example visit-preparation summary B/i,
    });
    fireEvent.click(secondCaseButton);

    expect(
      await screen.findByText(
        "How should I organize questions for a future clinician visit?",
      ),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "http://127.0.0.1:8765/api/v1/demo/clinician/cases/synthetic-case-002",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "X-Demo-Role": "clinician",
        },
        cache: "no-store",
      },
    );
    expect(secondCaseButton).toHaveAttribute("aria-pressed", "true");
  });

  it.each([401, 403])(
    "shows a safe role-denied state for backend status %s without rendering its response body",
    async (status) => {
      const errorResponse = response(
        {
          detail: "Clinician demo role not authorized",
          unexpected: "Do not display backend-provided details",
        },
        false,
        status,
      );
      const fetchMock = vi.fn().mockResolvedValue(errorResponse);
      vi.stubGlobal("fetch", fetchMock);

      render(<ClinicianDashboard />);

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Clinician demo access was not authorized",
      );
      expect(screen.getByRole("alert")).toHaveTextContent(
        "The backend did not authorize this clinician demo request.",
      );
      expect(
        screen.getAllByText(/production authentication is disabled/i),
      ).toHaveLength(2);
      expect(
        screen.queryByText("Do not display backend-provided details"),
      ).not.toBeInTheDocument();
      expect(screen.queryByRole("list", { name: "Synthetic cases" })).not.toBeInTheDocument();
      expect(errorResponse.json).not.toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    },
  );
});
