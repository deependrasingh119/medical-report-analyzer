# t7 — Clinician Demo Backend Slice

## Summary

Added two read-only FastAPI routes for fixed fictional clinician cases and backend enforcement of the exact demo-only `X-Demo-Role: clinician` header. The missing role is rejected with 401; patient and all other role values receive a fixed 403. The fixtures are source-code-only, deterministic, and visibly labeled synthetic. Existing health and explanation routes remain intact.

## Deliverables

- [t7-backend-api-contract.md](./t7-backend-api-contract.md) — endpoint, role boundary, response, safety, and verification contract.
- [t7-backend-batch-report.yaml](./t7-backend-batch-report.yaml) — structured file, requirement, upstream, and test evidence.
- [checkpoints/tasks-to-impl.yaml](./checkpoints/tasks-to-impl.yaml) — consolidated implementation traceability checkpoint through t7.

## Upstream Artifacts Consumed

- `.github/modernize/rearchitecture/plan.md#Delivery Boundaries and Acceptance` — synthetic-only boundary and deferred real-data gates.
- `.github/modernize/rearchitecture/.metadata/tasks.json#005-clinician-demo-workflow.requirements` — approved clinician case-review scope and role requirement.
- `.github/modernize/rearchitecture/clarification-answers.md#B3/B4/G1/G2` — deferred database/identity and privacy/clinical gates.
- `.github/modernize/rearchitecture/artifacts/t4-backend-api-contract.md#API Contract` and `#Boundary and Error Behavior` — API prefix and privacy/error requirements.
- `.github/modernize/rearchitecture/artifacts/t5-backend-api-contract.md#Endpoint` and `#Safety and Data Boundary` — preserved explanation route and bodyless synthetic endpoint pattern.
- `backend/tests/test_main.py`, `backend/tests/test_explanations.py` — existing API route and explanation contracts.
- `.github/modernize/rearchitecture/learnings/backend/api-boundary-contract.md` — backend boundary conventions.
- `.github/modernize/rearchitecture/board.md` — read-only task order context.

## Evidence Mapping

- `tasks.json#005-clinician-demo-workflow.requirements` → `backend/app/clinician_cases.py` and `backend/tests/test_clinician_cases.py` → deterministic source-code fixtures, authorization cases, detail/list schemas, and non-echoing error tests.
- `t4-backend-api-contract.md#API Contract` + `t5-backend-api-contract.md#Endpoint` → `backend/app/main.py` + `backend/tests/test_main.py` → health and explanation endpoints retained under `/api/v1`; all route paths verified.
- `plan.md#Delivery Boundaries and Acceptance` → test suite and live probes → only fixed synthetic data is returned; there is no persistence, upload, PHI, production auth, or live AI.

## Test Results

- Command: `& '.\.venv\Scripts\python.exe' -m pytest backend\tests -q`
- Passed: 18
- Failed: 0
- Skipped: 0
- Failures: none.
- `& '.\.venv\Scripts\python.exe' -m compileall -q backend` — PASS.
- `& '.\.venv\Scripts\python.exe' -m pip check` — PASS; no broken requirements.
- Live endpoint probes: PASS — health 200; explanation 200; missing role 401; patient role 403; clinician list/detail 200; unknown case 404; POST 405; OpenAPI 200.

## Findings and Issues

- No implementation blocker. The role header is a demo-only, forgeable boundary and is not production authentication.
- No production identity, database, persistence, file handling, PHI, logging of request content, live AI, diagnosis, triage, or treatment behavior was introduced.
- Frontend integration, accessibility, security, and end-to-end gates remain owned by downstream tasks.
