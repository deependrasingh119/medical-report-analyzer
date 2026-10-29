"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

type SyntheticClinicianCase = {
  case_id: "synthetic-case-001" | "synthetic-case-002";
  title: string;
  data_label: "fictional synthetic case";
  prepared_summary: string;
  prepared_questions: string[];
  clinician_review_context: true;
};

type SyntheticClinicianCaseList = {
  mode: "synthetic-demo";
  data_label: "fictional synthetic cases";
  read_only: true;
  cases: SyntheticClinicianCase[];
};

type SyntheticClinicianCaseDetail = {
  mode: "synthetic-demo";
  read_only: true;
  case: SyntheticClinicianCase;
  safety_notice: string;
};

type RequestError = "role-denied" | "unavailable";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_CARELENS_API_URL || "http://127.0.0.1:8765"
).replace(/\/+$/, "");
const CASES_URL = `${API_BASE_URL}/api/v1/demo/clinician/cases`;
const DEMO_HEADERS = {
  Accept: "application/json",
  "X-Demo-Role": "clinician",
};
const SYNTHETIC_CASE_IDS = new Set([
  "synthetic-case-001",
  "synthetic-case-002",
]);

class ClinicianDemoRequestError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ClinicianDemoRequestError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isSyntheticCase(value: unknown): value is SyntheticClinicianCase {
  return (
    isRecord(value) &&
    typeof value.case_id === "string" &&
    SYNTHETIC_CASE_IDS.has(value.case_id) &&
    typeof value.title === "string" &&
    value.data_label === "fictional synthetic case" &&
    typeof value.prepared_summary === "string" &&
    Array.isArray(value.prepared_questions) &&
    value.prepared_questions.length > 0 &&
    value.prepared_questions.every(
      (question) => typeof question === "string",
    ) &&
    value.clinician_review_context === true
  );
}

function isSyntheticCaseList(
  value: unknown,
): value is SyntheticClinicianCaseList {
  return (
    isRecord(value) &&
    value.mode === "synthetic-demo" &&
    value.data_label === "fictional synthetic cases" &&
    value.read_only === true &&
    Array.isArray(value.cases) &&
    value.cases.every(isSyntheticCase)
  );
}

function isSyntheticCaseDetail(
  value: unknown,
  expectedCaseId: string,
): value is SyntheticClinicianCaseDetail {
  return (
    isRecord(value) &&
    value.mode === "synthetic-demo" &&
    value.read_only === true &&
    isSyntheticCase(value.case) &&
    value.case.case_id === expectedCaseId &&
    typeof value.safety_notice === "string"
  );
}

async function requestJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    method: "GET",
    headers: DEMO_HEADERS,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ClinicianDemoRequestError(
      "Clinician demo request was not successful",
      response.status,
    );
  }

  return response.json();
}

function requestErrorType(error: unknown): RequestError {
  if (
    error instanceof ClinicianDemoRequestError &&
    (error.status === 401 || error.status === 403)
  ) {
    return "role-denied";
  }

  return "unavailable";
}

function requestErrorCopy(error: RequestError): string {
  return error === "role-denied"
    ? "The backend did not authorize this clinician demo request."
    : "The synthetic clinician demo is temporarily unavailable.";
}

export function ClinicianDashboard() {
  const [cases, setCases] = useState<SyntheticClinicianCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [caseDetail, setCaseDetail] =
    useState<SyntheticClinicianCaseDetail | null>(null);
  const [isListLoading, setIsListLoading] = useState(true);
  const [listError, setListError] = useState<RequestError | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<RequestError | null>(null);

  const loadCases = useCallback(async () => {
    setIsListLoading(true);
    setListError(null);
    setCases([]);
    setSelectedCaseId(null);
    setCaseDetail(null);
    setDetailError(null);

    try {
      const payload = await requestJson(CASES_URL);
      if (!isSyntheticCaseList(payload)) {
        throw new Error("Unexpected synthetic case list");
      }

      setCases(payload.cases);
      setSelectedCaseId(payload.cases[0]?.case_id ?? null);
    } catch (error) {
      setListError(requestErrorType(error));
    } finally {
      setIsListLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCases();
  }, [loadCases]);

  useEffect(() => {
    if (!selectedCaseId) {
      return;
    }

    const requestedCaseId = selectedCaseId;
    let isCurrentRequest = true;
    setIsDetailLoading(true);
    setDetailError(null);
    setCaseDetail(null);

    async function loadCaseDetail() {
      try {
        const payload = await requestJson(
          `${CASES_URL}/${encodeURIComponent(requestedCaseId)}`,
        );
        if (!isSyntheticCaseDetail(payload, requestedCaseId)) {
          throw new Error("Unexpected synthetic case detail");
        }

        if (isCurrentRequest) {
          setCaseDetail(payload);
        }
      } catch (error) {
        if (isCurrentRequest) {
          setDetailError(requestErrorType(error));
        }
      } finally {
        if (isCurrentRequest) {
          setIsDetailLoading(false);
        }
      }
    }

    void loadCaseDetail();
    return () => {
      isCurrentRequest = false;
    };
  }, [selectedCaseId]);

  const selectedSummary = cases.find(
    (caseSummary) => caseSummary.case_id === selectedCaseId,
  );

  return (
    <section
      className="secondary-view clinician-dashboard"
      aria-labelledby="clinician-title"
    >
      <p className="eyebrow">CLINICIAN DEMO WORKSPACE</p>
      <h1 id="clinician-title">Review prepared questions</h1>
      <p className="clinician-intro">
        Review fixed example summaries and questions in a clinician-review
        context. No real patient records or sharing are available.
      </p>

      <aside
        className="safety-banner clinician-boundary"
        role="note"
        aria-label="Clinician demo and authentication boundary"
      >
        <span className="safety-icon" aria-hidden="true">
          i
        </span>
        <p>
          <strong>Fictional synthetic cases only; clinician review required.</strong>{" "}
          Requests use the backend-checked <code>X-Demo-Role: clinician</code>{" "}
          demo header. This is not production authentication. Production
          authentication is disabled.
        </p>
      </aside>

      <div className="clinician-workspace-grid">
        <section
          className="clinician-list-panel"
          aria-labelledby="synthetic-cases-title"
        >
          <div className="clinician-panel-heading">
            <div>
              <p className="eyebrow">READ-ONLY EXAMPLES</p>
              <h2 id="synthetic-cases-title">Fixed synthetic cases</h2>
            </div>
            <span className="case-count" aria-label={`${cases.length} examples`}>
              {cases.length}
            </span>
          </div>

          {isListLoading && (
            <p className="clinician-feedback" role="status">
              Loading fixed synthetic cases…
            </p>
          )}

          {listError && (
            <div className="clinician-feedback clinician-error" role="alert">
              <AlertCircle size={19} aria-hidden="true" />
              <div>
                <p className="clinician-feedback-title">
                  {listError === "role-denied"
                    ? "Clinician demo access was not authorized"
                    : "Cases could not be loaded"}
                </p>
                <p>{requestErrorCopy(listError)}</p>
                <p>
                  Production authentication is disabled; the demo header is
                  not a sign-in or production security.
                </p>
                <button
                  className="clinician-retry"
                  type="button"
                  onClick={() => void loadCases()}
                >
                  <RefreshCw size={15} aria-hidden="true" />
                  Try again
                </button>
              </div>
            </div>
          )}

          {!isListLoading && !listError && cases.length === 0 && (
            <p className="clinician-feedback">
              No fixed examples are available.
            </p>
          )}

          {cases.length > 0 && (
            <ul className="clinician-case-list" aria-label="Synthetic cases">
              {cases.map((caseSummary) => (
                <li key={caseSummary.case_id}>
                  <button
                    className="clinician-case-button"
                    type="button"
                    aria-pressed={selectedCaseId === caseSummary.case_id}
                    onClick={() => setSelectedCaseId(caseSummary.case_id)}
                  >
                    <span className="case-data-label">
                      {caseSummary.data_label}
                    </span>
                    <strong>{caseSummary.title}</strong>
                    <span>{caseSummary.prepared_summary}</span>
                    <span className="case-action">Review example</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          className="clinician-detail-panel"
          aria-labelledby="case-review-title"
        >
          <p className="eyebrow">CLINICIAN REVIEW CONTEXT</p>
          <h2 id="case-review-title">Case review</h2>

          {isDetailLoading && (
            <p className="clinician-feedback" role="status">
              Loading synthetic case details…
            </p>
          )}

          {detailError && (
            <div className="clinician-feedback clinician-error" role="alert">
              <AlertCircle size={19} aria-hidden="true" />
              <div>
                <p className="clinician-feedback-title">
                  {detailError === "role-denied"
                    ? "Clinician demo access was not authorized"
                    : "Case details could not be loaded"}
                </p>
                <p>{requestErrorCopy(detailError)}</p>
              </div>
            </div>
          )}

          {!isDetailLoading && !detailError && caseDetail && (
            <article
              className="clinician-detail"
              aria-labelledby="reviewed-case-title"
            >
              <div className="clinician-detail-heading">
                <div>
                  <span className="case-data-label">
                    {caseDetail.case.data_label}
                  </span>
                  <h3 id="reviewed-case-title">{caseDetail.case.title}</h3>
                </div>
                <span className="read-only-label">Read only</span>
              </div>

              <section
                className="clinician-summary"
                aria-labelledby="prepared-summary-title"
              >
                <h4 id="prepared-summary-title">Prepared summary</h4>
                <p>{caseDetail.case.prepared_summary}</p>
              </section>

              <section aria-labelledby="prepared-questions-title">
                <h4 id="prepared-questions-title">
                  Questions prepared for discussion
                </h4>
                <ul className="clinician-question-list">
                  {caseDetail.case.prepared_questions.map((question) => (
                    <li key={question}>{question}</li>
                  ))}
                </ul>
              </section>

              <aside className="clinician-review-context" role="note">
                <strong>Clinician review required</strong>
                <p>
                  These fictional preparation notes are for conversation only.
                  They do not support clinical decisions and are not a
                  diagnosis, triage, or treatment recommendation.
                </p>
              </aside>
              <p className="clinician-safety-copy">
                {caseDetail.safety_notice}
              </p>
            </article>
          )}

          {!isDetailLoading &&
            !detailError &&
            !caseDetail &&
            !selectedSummary &&
            !listError && (
              <p className="clinician-feedback">
                Choose a fixed synthetic example to review.
              </p>
            )}
        </section>
      </div>
    </section>
  );
}
