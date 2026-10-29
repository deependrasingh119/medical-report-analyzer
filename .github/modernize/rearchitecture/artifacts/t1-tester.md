# t1 — CareLens prototype behavior baseline

**Approved task:** 001 (`001-setup-baseline`)  
**Captured:** 2026-10-29T11:31:56Z onward  
**Target:** workspace root
**Scope:** Existing static prototype only. No real report or PHI was used.

## Upstream Artifacts Consumed
- `.github/modernize/rearchitecture/plan.md` — approved product scope, demo safety limits, and UI intent.
- `.github/modernize/rearchitecture/.metadata/tasks.json` — task 001 snapshot and behavior requirements.
- `.github/modernize/rearchitecture/clarification-answers.md` — confirmed CareLens styling starting point and responsive/accessibility expectations.

## Evidence Mapping
- `tasks.json#001-setup-baseline.requirements` overview behavior → Browser observations below; `index.html` initially renders Overview and its patient-preparation copy.
- `tasks.json#001-setup-baseline.requirements` report selection → Browser observations below; static source inspection of `app.js` establishes accepted types, size boundary, and validation messages.
- `tasks.json#001-setup-baseline.requirements` non-connected review action → Browser observation below; review shows the explicit not-uploaded/opened/analyzed notice.
- `tasks.json#001-setup-baseline.requirements` clinician preview → Browser observation below; clinician view is an informational placeholder with no patient sharing.
- `plan.md#Delivery Boundaries and Acceptance` synthetic-only / no connected services → The source inventory and observed non-connected interactions document the prototype boundary; this capture used only temporary synthetic fixtures.

## Root Snapshot Manifest

The original root files remain in place and were not modified. To identify the exact baseline without duplicating source code into artifacts, their byte counts and SHA-256 fingerprints were captured:

| File | Bytes | SHA-256 |
|---|---:|---|
| `README.md` | 1,218 | `B3529193AF9E0B1FAA28666B267DA3CBD81A36E531723C2EA9B35E64FCFDCAAC` |
| `app.js` | 3,675 | `7C859AB4EA44AF987B8AB1517305B4A9501B48EE8D114E9D554F7988D344E0C1` |
| `index.html` | 10,073 | `324BB29EC72BDEE864476F90821AAAA668E98E99A29269A0016AC47339177E42` |
| `styles.css` | 15,549 | `46F437D32DB9E0FA7C3985D81EE7B1C5DD9A351773675CBC132F0833D7776F4D` |

No separate source archive was created. The source files themselves and these fingerprints are the preservation reference for the implementation tasks.

## Observable Baseline

### Overview
- Page title: “CareLens — Make sense of your report”; initial selected navigation is Overview.
- Patient-facing headline: “Understand your report. Prepare for what’s next.”
- The page describes report literacy and preparation for a conversation with a care team.
- Safety copy says CareLens is not a diagnosis and directs interpretation and care decisions to a clinician.
- A “Prototype” status pill and a privacy card state that reports are not uploaded or saved.
- The overview includes a report selector, two preparation steps, an informational disclaimer, and an urgent-help anchor.

### Report selection and review
- File picker advertises PDF, JPG, and PNG, up to 20 MB. Code checks a maximum of `20 * 1024 * 1024` bytes (20 MiB).
- Runtime accepted a temporary synthetic-only file named `carelens-synthetic-demo.pdf`; the UI displayed its name and `0.0 MB`, enabled “Prepare to review,” and left the notice hidden.
- A synthetic `.txt` selection displayed exactly: `Choose a PDF, JPG or PNG file.` Selection remained hidden and the review button was disabled.
- A synthetic PDF sized 20 MiB + 1 byte displayed exactly: `This file is larger than 20 MB. Choose a smaller file.` Selection remained hidden and the review button was disabled.
- After selecting the synthetic file, “Prepare to review” displayed: `Report analysis is not connected yet.` and `Your file has not been uploaded, opened, or analyzed. Connect a secure, clinician-reviewed service before enabling report explanations.`
- “Remove selected file” is wired to clear the input, selected-file display, review button state, and prototype notice.
- Source inspection shows selection reads only the file's metadata (`name`, `type`, `size`); `app.js` has no file-content reader, upload, storage, or analysis flow. Runtime probes used only the temporary synthetic fixtures described above; no real report was selected.
- Validation nuance for migration: the current source rejects only when both MIME type and allowed extension fail, so an allowed extension can pass with an unrecognized MIME type (and vice versa). The file picker’s `accept` hint is not a substitute for application-side security validation.

### Reports view
- “My reports” navigation hides Overview, shows an empty state titled “No reports here yet,” and says reports are not saved.
- “Back to overview” returns to the Overview panel.
- Navigation updates the active link and breadcrumb; the app does not load or retrieve report records.

### Clinician preview
- “For clinicians” opens a static informational panel titled “For clinicians.”
- It says patient information is not collected or shared and displays “Clinician tools are not connected yet.”
- The panel describes patient-led questions and clinician-guided care; it has no case list, review action, authentication, or backend interaction.

## Existing Test Assets and Environment
- Root application files are `index.html`, `styles.css`, and `app.js`; `README.md` instructs opening `index.html` directly in a browser.
- No `package.json`, Python dependency manifest, test configuration, or test-like files were found in the project root/scan. No existing unit, integration, or E2E suites or canonical test command are present.
- Current prototype has no backend, database, external service, or authentication implementation. Existing source describes interface previews only; no test source root or migration-resource integration tests exist.
- CSS custom properties: `--ink`, `--muted`, `--green`, `--green-dark`, `--green-soft`, `--paper`, `--canvas`, `--line`, and `--amber`.
- Responsive CSS breakpoints include `max-width: 900px`, `650px`, and `380px`; reduced-motion preferences are also handled. This is a source inventory, not a responsive conformance test.

## Test Results
- Command: `Get-ChildItem -Recurse -File -Include '*.test.*','*.spec.*','*Test*.py','*test*.py'` — no existing test files found.
- Automated test command: none available; no test runner or test manifest exists.
- Browser verification: opened the existing `index.html` via `file:///.../index.html`; exercised Overview, synthetic accepted file selection, review notice, invalid synthetic type, oversize synthetic file, Reports, and Clinician preview.
- Manual browser observations: 7 checks passed, 0 failed, 0 skipped. These are baseline observations, not an automated suite.
- Integrity verification: `Get-FileHash -Algorithm SHA256` for the four root files matched the manifest; required report sections and approved input files were present; temporary fixtures were absent (PowerShell verification returned 0).
- Integration: 0 tests available; there is no API/backend in the existing prototype.
- No test code or production source was changed.

## Verdict
integration: UNVERIFIED — no backend/API or integration suite exists in the source prototype.  
e2e: PARTIAL — browser smoke observations covered the overview, synthetic-only selection/review behavior, Reports empty state, and clinician preview; no automated end-to-end suite exists.  
overall: NEEDS_SIGNOFF — existing behavior has been recorded for migration; this does not certify the new implementation or satisfy task 006 validation.

## Issues Found
- **INFO:** Prototype screens are placeholders, not connected report-processing or clinician-sharing services. Preserve that distinction; do not infer working integrations from the UI.
- **INFO:** Current picker validation uses MIME-or-extension acceptance and must not be treated as a security boundary for future functionality.
- No source-code bug was changed by this tester task. Future validation must use synthetic fixtures only and retain the plan’s real-data, production-auth/database/cloud, and live-AI gates.
