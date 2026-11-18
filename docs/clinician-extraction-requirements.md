# CareLens clinician extraction requirements

**Status:** Draft requirements; local OCR prototype is implemented; not a production-readiness or compliance sign-off
**Intended users:** Clinicians and authorized clinical staff
**Initial region:** India
**Development data:** Synthetic documents only
**Initial workflow:** Extract fields from scanned laboratory-result PDFs for clinician verification

## 1. Intended use and exclusions

CareLens is intended to help an authenticated clinician review information transcribed from a laboratory-report PDF. The original report remains the source of truth. Every extracted value must be verifiable against its source page.

The initial version must not diagnose, triage, rank clinical risk, recommend treatment, or make care decisions. It must not claim that OCR output is accurate or clinically validated. A clinician must verify extracted information before relying on it.

## 2. Scope

### Included in the initial workflow

- Scanned laboratory-result PDFs.
- Local Tesseract OCR transcription of visible report content for the development prototype only.
- A review screen that presents source pages beside extracted fields.
- Field provenance, including the source page and a location reference when available.
- Explicit indication of uncertain, missing, or unreadable content.
- Authenticated multi-user access in a hosted deployment.
- User-authorized deletion of a report and its associated derived data.

### Excluded until separately specified and reviewed

- Diagnosis, triage, treatment recommendations, or automated clinical conclusions.
- Other report types, languages, and non-PDF inputs.
- Patient-facing interpretation or automated release of extracted results.
- Use with real patient information during development or before the required reviews.
- OpenAI processing of report content in the initial extraction-only workflow.

The prototype uses English Tesseract OCR, with 10 MB and 20-page request limits and temporary server-side files. These are development defaults, not approved production limits. Hosted OCR/provider selection, language support, retention periods, and backup-deletion timing remain open decisions and must be resolved before a real-data pilot.

## 3. Functional requirements

| ID | Requirement | Acceptance evidence |
|---|---|---|
| FR-01 | The service accepts only the approved scanned laboratory PDF format and rejects unsupported, malformed, encrypted, or over-limit files with a clear error. | API tests cover valid synthetic PDFs and each rejected-file case; exact limits are approved before implementation. |
| FR-02 | The service processes a document only for an authenticated user and associates the report and all derived records with that user. | Tests prove anonymous requests are denied and one user cannot read, change, or delete another user's records. |
| FR-03 | The service extracts visible text without inventing absent values. It preserves the transcription and units as shown in the source. | Synthetic fixtures include varied layouts, missing fields, and ambiguous characters; expected extraction is compared field by field. |
| FR-04 | Every displayed extracted field identifies its source page. A location reference is shown when the OCR engine can supply one; unavailable location data is explicitly labeled unavailable. | UI/API tests check page provenance and verify that missing location data is not fabricated. |
| FR-05 | Uncertain, unreadable, or conflicting content is marked for human review and is not silently converted into a confident value. | Fixtures with blur, low contrast, and ambiguous characters produce an uncertainty state and preserve the source text/image for review. |
| FR-06 | The review screen shows the report source next to the extracted fields and allows a clinician to compare them. | Browser test verifies both the source page and extracted field are visible and navigable. |
| FR-07 | The interface prominently identifies the output as machine-extracted and unverified, and instructs the clinician to check it against the original. | Accessibility and UI tests assert the notice appears before or alongside extracted values. |
| FR-08 | An authorized user can delete a report and its associated extracted data. | Integration test verifies deletion removes access to the file, OCR output, and report metadata; backup behavior is documented separately. |
| FR-09 | The API reports processing status and failures explicitly; an OCR or storage failure is not presented as a successful extraction. | Tests cover processing, failure, retry, and incomplete states. |
| FR-10 | The initial workflow does not send report content to OpenAI or another generative-AI service. | Configuration and integration tests verify no AI provider call is made by the extraction workflow. |

### Implemented local prototype boundary

- The `/api/v1/demo/ocr` route is disabled unless `CARELEN_ENABLE_LOCAL_SYNTHETIC_OCR=1` is explicitly set for the backend process.
- The route accepts loopback requests only, requires a synthetic-data confirmation, caps uploads at 10 MB and 20 pages, and rejects encrypted PDFs.
- It runs Tesseract locally, returns OCR text, per-word confidence and normalized source positions, plus temporary rendered page previews.
- Uploaded PDF files are held in a temporary directory that is removed when request processing completes. No database or object storage is used by this route.
- The returned data is unverified transcription. There is no AI interpretation, authentication, user ownership, clinical validation, or production privacy boundary.

## 4. Data and security requirements

- Use Supabase Auth for identity and PostgreSQL plus private object storage only after the access-control design is reviewed.
- Verify user identity in the backend; do not treat a frontend-supplied user ID or demo role header as authentication.
- Enforce ownership checks server-side for every report read, update, export, and delete operation.
- Deny public access to report objects. Use short-lived access mechanisms only where necessary and ensure authorization precedes access.
- Do not put report contents, OCR text, access tokens, or secrets in application logs, analytics, crash reports, or URLs.
- Keep provider credentials on the server and out of source control, frontend bundles, and client-visible errors.
- Define encryption, key management, backup, incident response, audit-log access, and retention controls before any real-data pilot.
- Make consent and data-handling notices understandable before upload. Document all processors and locations where data may be handled.
- Specify deletion propagation for the original file, OCR output, database records, caches, logs, and backups; manual deletion alone does not define a complete retention policy.
- Use synthetic documents for development, automated tests, demos, and screenshots. Do not use real patient information until a separately approved process is in place.

## 5. Clinical and OCR quality requirements

- A qualified clinical reviewer must approve the intended use, representative test cases, review workflow, and release criteria before a real-data pilot.
- Measure OCR performance by field and document conditions, including names of tests, values, units, reference intervals, flags, and page provenance.
- Report results by relevant document subgroups and image-quality conditions; do not rely only on an aggregate accuracy score.
- Set acceptance thresholds with the clinical reviewer before validation. Thresholds are not yet defined.
- Keep the original report available during review so clinicians can detect extraction mistakes.
- Provide a correction/rejection mechanism and ensure corrections are auditable without overwriting the original source.
- Re-test after changing the OCR engine, preprocessing, supported document layouts, or extraction logic.

## 6. Proposed architecture (subject to review)

1. **Frontend:** Next.js/React upload and review interface; Supabase Auth sign-in.
2. **API:** FastAPI service validates the authenticated identity, file constraints, ownership, and processing state.
3. **Storage:** Private object storage for the original PDF; PostgreSQL for metadata, processing state, and reviewed extraction records.
4. **OCR:** The local synthetic prototype uses Tesseract. A production provider and whether processing is local or hosted are undecided. The initial workflow must not call OpenAI.
5. **Review:** Display extracted fields and source pages together; do not present OCR as verified clinical interpretation.

The current repository does not yet implement these capabilities. Its existing API and screens are synthetic demo fixtures.

## 7. Release gates

### Gate A — Local development

- Synthetic data only.
- No production credentials or patient data.
- File-handling and OCR behavior tested on synthetic fixtures.
- Clear non-production labeling.

### Gate B — Security and privacy review

- Threat model and data-flow inventory approved.
- Authentication, authorization, storage policies, secrets management, logging, deletion, backups, and incident response reviewed and tested.
- India-specific privacy, hosting, cross-border processing, and contractual obligations assessed by qualified advisors.

### Gate C — Clinical and regulatory review

- Qualified clinical reviewer assigned and approves intended use and validation protocol.
- Extraction quality thresholds and representative validation set approved.
- Qualified India regulatory counsel assesses whether the intended clinician-support function is subject to medical-device or other regulatory requirements.
- No pilot with real patient information until all required organizational and legal approvals are documented.

### Gate D — Controlled pilot decision

- All prior gates pass, operational owners are assigned, and pilot scope, monitoring, support, rollback, and incident escalation are approved.
- A successful technical build or test suite alone does not satisfy this gate or establish fitness for clinical use.

## 8. Open decisions

1. Which OCR engine/provider will be used, and where will document processing occur?
2. Which Indian languages and report layouts are in scope?
3. What file-size, page-count, and processing-time limits apply?
4. What retention period applies to originals, OCR output, logs, and backups?
5. Which hosting region and deployment environment will be used?
6. Who is the named clinical reviewer and accountable clinical owner?
7. What field-level accuracy thresholds and validation dataset will be approved?
8. Which organization will own privacy notices, consent, support, and incident response?
9. What independent security testing and India-specific legal/regulatory review are required before a pilot?
