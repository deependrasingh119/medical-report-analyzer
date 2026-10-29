import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PatientPreparation } from "../components/patient-preparation";

const demoExplanation = {
  mode: "synthetic-demo",
  fixture_id: "synthetic-blood-count-01",
  title: "Illustrative blood-count example",
  illustrative_only: true,
  clinician_review_required: true,
  summary:
    "This fixed, fictional example shows how a result can be displayed beside an example reference interval. It does not interpret real reports.",
  highlights: [
    {
      label: "Hemoglobin",
      synthetic_value: "13.4 g/dL",
      example_reference_interval: "12.0–16.0 g/dL",
      note: "In this synthetic sample, the value falls within the example interval. Laboratory intervals and individual context can vary.",
    },
  ],
  discussion_questions: [
    "How does this laboratory's reference interval apply to my results?",
    "Which results should I discuss in the context of my health history?",
  ],
  safety_notice:
    "Synthetic demo only; illustrative, not a diagnosis, triage, or treatment recommendation, and not a substitute for professional care. A qualified clinician must review real reports.",
};

function response(payload: unknown, ok = true) {
  return {
    ok,
    json: vi.fn().mockResolvedValue(payload),
  } as unknown as Response;
}

describe("patient preparation demo", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads the fixed synthetic explanation through the bodyless GET contract", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response(demoExplanation));
    vi.stubGlobal("fetch", fetchMock);

    render(<PatientPreparation />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading the fixed synthetic example");
    expect(
      await screen.findByRole("heading", {
        name: "Illustrative blood-count example",
      }),
    ).toBeInTheDocument();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:8765/api/v1/demo/explanation",
      {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      },
    );
    expect(screen.getByText("13.4 g/dL")).toBeInTheDocument();
    expect(screen.getByText(/clinician review required/i)).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(document.querySelector('input[type="file"]')).not.toBeInTheDocument();
  });

  it("updates the visit summary only from fixed question selections", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response(demoExplanation)));
    render(<PatientPreparation />);

    const firstQuestion =
      "How does this laboratory's reference interval apply to my results?";
    const secondQuestion =
      "Which results should I discuss in the context of my health history?";
    const firstCheckbox = await screen.findByRole("checkbox", {
      name: firstQuestion,
    });

    expect(firstCheckbox).toBeChecked();
    expect(screen.getByRole("list", { name: "Selected questions" })).toHaveTextContent(
      firstQuestion,
    );
    expect(screen.getByRole("list", { name: "Selected questions" })).toHaveTextContent(
      secondQuestion,
    );

    fireEvent.click(firstCheckbox);

    await waitFor(() => {
      expect(firstCheckbox).not.toBeChecked();
      expect(
        screen.getByRole("list", { name: "Selected questions" }),
      ).not.toHaveTextContent(firstQuestion);
      expect(
        screen.getByRole("list", { name: "Selected questions" }),
      ).toHaveTextContent(secondQuestion);
    });
    expect(screen.getByText(/not stored or sent/i)).toBeInTheDocument();
  });

  it("shows a safe retry state when the API is unavailable", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response({}, false))
      .mockResolvedValueOnce(response(demoExplanation));
    vi.stubGlobal("fetch", fetchMock);

    render(<PatientPreparation />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The synthetic example is temporarily unavailable.",
    );
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(
      await screen.findByRole("heading", {
        name: "Illustrative blood-count example",
      }),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
