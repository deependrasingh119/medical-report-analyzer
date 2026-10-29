# t7 — Synthetic Clinician Case API Contract

## Scope

This contract covers only the backend slice of approved task `005-clinician-demo-workflow`. It adds read-only access to fixed, source-code synthetic clinician case examples under the existing `/api/v1` prefix. It does not implement the frontend dashboard.

## Demo Role Boundary

Clinician case routes require the `X-Demo-Role: clinician` header. The FastAPI backend enforces the exact role before returning a case or looking up its identifier:

| Condition | Status | Fixed response |
|---|---:|---|
| Header missing | 401 | `{"detail":"Clinician demo role required"}` |
| Header value is `patient` or anything other than `clinician` | 403 | `{"detail":"Clinician demo role not authorized"}` |
| Authorized clinician requests unknown case ID | 404 | `{"detail":"Synthetic demo case not found"}` |

Error responses do not include the supplied role, case identifier, or body. The header is a forgeable, demo-only UI boundary; it is **not authentication** and must not be used to protect real accounts, patient data, or production endpoints. There are no accounts, tokens, identity-provider calls, or session state.

## Endpoints

| Method | Path | Request | Success |
|---|---|---|---|
| GET | `/api/v1/demo/clinician/cases` | Required `X-Demo-Role: clinician`; no body, query, or client-supplied fixture data | `200` with fixed synthetic case summaries |
| GET | `/api/v1/demo/clinician/cases/{case_id}` | Required `X-Demo-Role: clinician`; only the path case ID | `200` with the fixed synthetic case detail |

Both operations are read-only. OpenAPI declares no request body. Unsupported `POST` returns `405`; supplied payload content is not reflected. The list and detail are deterministic and contain two fixed fictional examples, each labeled `fictional synthetic case`. The response marks `mode: synthetic-demo` and `read_only: true`. Detail includes a clinician-review context and safety notice that the notes are not diagnosis, triage, or treatment recommendations.

### Response Shape

- List: `mode`, `data_label`, `read_only`, and `cases[]`.
- Case summary/detail: `case_id`, `title`, `data_label`, `prepared_summary`, `prepared_questions[]`, and `clinician_review_context`.
- Detail wrapper: `mode`, `read_only`, `case`, and `safety_notice`.

All fixture content is authored in `backend/app/clinician_cases.py`. No user-provided clinical values, report files, patient-entered values, persistence, PHI, logging, live AI, diagnosis, triage, or treatment behavior is added. CORS permits `X-Demo-Role` only alongside the already configured localhost origins; credentials remain disabled.

## Verification

- The health and existing `/api/v1/demo/explanation` routes remain available.
- Tests cover missing role, patient and unknown roles, clinician access, deterministic fixture data, unknown case, no request body, POST rejection/no body echo, route inventory, and CORS for the demo header.
- Live probes confirmed HTTP 200 for health, explanation, clinician list/detail, and OpenAPI; 401 missing role; 403 patient role; 404 unknown ID; and 405 POST.

## Upstream Artifacts Consumed

- `.github/modernize/rearchitecture/plan.md#Delivery Boundaries and Acceptance` — synthetic-only delivery, no real PHI, no production auth/database/AI, and no diagnostic or treatment behavior.
- `.github/modernize/rearchitecture/.metadata/tasks.json#005-clinician-demo-workflow.requirements` — clinician case review using synthetic cases and backend-enforced role boundary.
- `.github/modernize/rearchitecture/clarification-answers.md#B3/B4/G1/G2` — database and managed identity remain deferred; clinical and privacy gates apply before real data.
- `.github/modernize/rearchitecture/artifacts/t4-backend-api-contract.md#API Contract` and `#Boundary and Error Behavior` — preserve `/api/v1`, no body logging, and CORS is not authorization.
- `.github/modernize/rearchitecture/artifacts/t5-backend-api-contract.md#Endpoint` and `#Safety and Data Boundary` — preserve the existing explanation route and synthetic/no-request-body convention.
- `backend/tests/test_main.py` and `backend/tests/test_explanations.py` — existing route inventory, health, CORS, explanation, no-body, and method contracts retained.
- `.github/modernize/rearchitecture/learnings/backend/api-boundary-contract.md` — keep feature routes versioned and separate; do not treat CORS as authorization.
- `.github/modernize/rearchitecture/board.md` — read-only task order/status context.

## Evidence Mapping

- `tasks.json#005-clinician-demo-workflow.requirements` → `backend/app/clinician_cases.py` → fixed list/detail schemas, exact demo role check, read-only fixtures, review context, and safety boundary.
- `plan.md#Delivery Boundaries and Acceptance` → `backend/tests/test_clinician_cases.py` → tests cover no unauthorized access, deterministic synthetic output, no request body, and no payload/role/case-ID echo.
- `t4-backend-api-contract.md#API Contract` and `t5-backend-api-contract.md#Endpoint` → `backend/app/main.py` and `backend/tests/test_main.py` → original `/api/v1/health` and `/api/v1/demo/explanation` routes remain registered; OpenAPI lists all four routes.
- `t4-backend-api-contract.md#Frontend Development Boundary` → `backend/app/main.py` and `backend/tests/test_main.py` → CORS permits only configured local origins, credentials remain off, and the explicit demo role header is allowed for local frontend calls.
- `tasks.json#005-clinician-demo-workflow.requirements` → live HTTP probes → clinician access returns 200, missing role 401, patient role 403, unknown case 404, and POST 405.

## Test Results

- Command: `& '.\.venv\Scripts\python.exe' -m pytest backend\tests -q`
- Passed: 18
- Failed: 0
- Skipped: 0
- Failures: none.
- Command: `& '.\.venv\Scripts\python.exe' -m compileall -q backend` — passed.
- Command: `& '.\.venv\Scripts\python.exe' -m pip check` — passed; no broken requirements.
- Live probes: started with `& '.\.venv\Scripts\python.exe' -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8765 --no-access-log`; health 200, explanation 200, missing role 401, patient role 403, clinician list 200, clinician detail 200, unknown case 404, POST 405, and OpenAPI 200. Both case GET operations declare no request body; health and explanation paths remain present.

## Remaining Gates

The demo header is deliberately not production authentication and can be forged. No claim is made about production access control, real patient sharing, clinical decision support, or production readiness. Managed identity, persistence, privacy/security review, and clinical validation remain deferred and required before any real-data enablement.
