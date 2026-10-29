"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, BookOpenText, CheckCircle2, RefreshCw } from "lucide-react";

type ExplanationHighlight = {
  label: string;
  synthetic_value: string;
  example_reference_interval: string;
  note: string;
};

type SyntheticExplanation = {
  mode: "synthetic-demo";
  fixture_id: "synthetic-blood-count-01";
  title: string;
  illustrative_only: true;
  clinician_review_required: true;
  summary: string;
  highlights: ExplanationHighlight[];
  discussion_questions: string[];
  safety_notice: string;
};

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_CARELENS_API_URL || "http://127.0.0.1:8765"
).replace(/\/+$/, "");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isSyntheticExplanation(
  value: unknown,
): value is SyntheticExplanation {
  if (!isRecord(value)) {
    return false;
  }

  const highlights = value.highlights;
  const questions = value.discussion_questions;

  return (
    value.mode === "synthetic-demo" &&
    value.fixture_id === "synthetic-blood-count-01" &&
    typeof value.title === "string" &&
    value.illustrative_only === true &&
    value.clinician_review_required === true &&
    typeof value.summary === "string" &&
    typeof value.safety_notice === "string" &&
    Array.isArray(highlights) &&
    highlights.every(
      (highlight) =>
        isRecord(highlight) &&
        typeof highlight.label === "string" &&
        typeof highlight.synthetic_value === "string" &&
        typeof highlight.example_reference_interval === "string" &&
        typeof highlight.note === "string",
    ) &&
    Array.isArray(questions) &&
    questions.length > 0 &&
    questions.every((question) => typeof question === "string")
  );
}

export function PatientPreparation() {
  const [explanation, setExplanation] =
    useState<SyntheticExplanation | null>(null);
  const [selectedQuestionIndexes, setSelectedQuestionIndexes] = useState<
    number[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadExplanation = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/demo/explanation`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error("Synthetic demo endpoint unavailable");
      }

      const payload: unknown = await response.json();
      if (!isSyntheticExplanation(payload)) {
        throw new Error("Unexpected synthetic demo response");
      }

      setExplanation(payload);
      setSelectedQuestionIndexes(
        payload.discussion_questions.map((_, index) => index),
      );
    } catch {
      setExplanation(null);
      setSelectedQuestionIndexes([]);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadExplanation();
  }, [loadExplanation]);

  function toggleQuestion(index: number, checked: boolean) {
    setSelectedQuestionIndexes((current) =>
      checked
        ? [...current, index]
        : current.filter((selectedIndex) => selectedIndex !== index),
    );
  }

  const selectedQuestions =
    explanation?.discussion_questions.filter((_, index) =>
      selectedQuestionIndexes.includes(index),
    ) ?? [];

  return (
    <section
      className="secondary-view patient-preparation"
      aria-labelledby="preparation-title"
    >
      <p className="eyebrow">PATIENT PREPARATION DEMO</p>
      <h1 id="preparation-title">Get ready for a clinician visit</h1>
      <p className="preparation-intro">
        Review one fixed example and choose questions for an illustrative visit
        summary. Your choices stay in this page and are not saved or sent.
      </p>

      <aside
        className="safety-banner preparation-safety"
        role="note"
        aria-label="Important synthetic demo and safety notice"
      >
        <span className="safety-icon" aria-hidden="true">
          i
        </span>
        <p>
          <strong>Synthetic and illustrative only.</strong> No report files or
          personal health information can be entered, opened, uploaded, saved,
          or shared here. This is not a diagnosis, triage, or treatment
          recommendation. A qualified clinician must review real reports.
        </p>
      </aside>

      <div className="preparation-grid">
        <section
          className="preparation-panel"
          aria-labelledby="example-heading"
        >
          <div className="preparation-panel-heading">
            <span className="upload-symbol" aria-hidden="true">
              <BookOpenText size={21} />
            </span>
            <div>
              <p className="eyebrow">FIXED EXAMPLE</p>
              <h2 id="example-heading">Explore an example highlight</h2>
            </div>
          </div>

          {isLoading && (
            <p className="preparation-status" role="status">
              Loading the fixed synthetic example…
            </p>
          )}

          {hasError && (
            <div className="preparation-error" role="alert">
              <AlertCircle size={19} aria-hidden="true" />
              <div>
                <p>The synthetic example is temporarily unavailable.</p>
                <button
                  className="retry-button"
                  type="button"
                  onClick={() => void loadExplanation()}
                >
                  <RefreshCw size={15} aria-hidden="true" />
                  Try again
                </button>
              </div>
            </div>
          )}

          {explanation && (
            <article className="synthetic-example">
              <span className="example-label">
                <CheckCircle2 size={15} aria-hidden="true" />
                Synthetic · illustrative only
              </span>
              <h3>{explanation.title}</h3>
              <p>{explanation.summary}</p>
              <ul className="highlight-list" aria-label="Synthetic highlights">
                {explanation.highlights.map((highlight) => (
                  <li key={highlight.label}>
                    <h4>{highlight.label}</h4>
                    <dl>
                      <div>
                        <dt>Example value</dt>
                        <dd>{highlight.synthetic_value}</dd>
                      </div>
                      <div>
                        <dt>Example interval</dt>
                        <dd>{highlight.example_reference_interval}</dd>
                      </div>
                    </dl>
                    <p>{highlight.note}</p>
                  </li>
                ))}
              </ul>
              <p className="clinician-review-note">
                Clinician review required before applying any information to a
                real person.
              </p>
            </article>
          )}
        </section>

        <section
          className="preparation-panel question-panel"
          aria-labelledby="questions-heading"
        >
          <p className="eyebrow">YOUR VISIT NOTES</p>
          <h2 id="questions-heading">Choose questions to discuss</h2>
          <p className="question-instructions">
            Select from these fixed prompts. There is no free-text field.
          </p>

          {explanation && (
            <>
              <fieldset className="question-options">
                <legend className="visually-hidden">
                  Fixed clinician discussion questions
                </legend>
                {explanation.discussion_questions.map((question, index) => (
                  <label className="question-option" key={question}>
                    <input
                      type="checkbox"
                      checked={selectedQuestionIndexes.includes(index)}
                      onChange={(event) =>
                        toggleQuestion(index, event.currentTarget.checked)
                      }
                    />
                    <span>{question}</span>
                  </label>
                ))}
              </fieldset>

              <div className="visit-summary" aria-labelledby="summary-heading">
                <div className="summary-heading-row">
                  <h3 id="summary-heading">Your visit question list</h3>
                  <span className="summary-count" role="status">
                    {selectedQuestions.length} selected
                  </span>
                </div>
                <p className="summary-disclaimer">
                  This illustrative summary uses only your fixed prompt
                  selections. It is not stored or sent.
                </p>
                {selectedQuestions.length > 0 ? (
                  <ul aria-label="Selected questions">
                    {selectedQuestions.map((question) => (
                      <li key={question}>{question}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-questions">
                    No questions selected. Choose a fixed prompt above to
                    include it.
                  </p>
                )}
              </div>
            </>
          )}

          {isLoading && (
            <p className="preparation-status">
              Fixed questions will appear when the demo example loads.
            </p>
          )}
          {hasError && (
            <p className="question-unavailable">
              Question choices are unavailable until the synthetic example can
              be loaded.
            </p>
          )}
        </section>
      </div>

      {explanation && (
        <p className="api-safety-notice">{explanation.safety_notice}</p>
      )}
    </section>
  );
}
