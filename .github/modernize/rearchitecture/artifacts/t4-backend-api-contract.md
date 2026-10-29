# t4 — Backend API Boundary Contract

## Purpose and Scope

This contract defines the t4 foundation only. It does not specify patient explanation, report, summary, clinician-case, or role-authorization routes; those feature contracts must be agreed in their assigned tasks. No real report or personal health information is accepted, processed, stored, or logged.

## API Contract

| Method | Path | Request | Success response | Other behavior |
|---|---|---|---|---|
| GET | `/api/v1/health` | No body or query parameters | `200` JSON: `status: "ok"`, `service: "carelens-demo-api"`, `mode: "synthetic-demo"` | `405` for unsupported methods |

The route is read-only and exposes process/demo status only. The FastAPI-generated OpenAPI document is available at `/openapi.json`; interactive API documentation is at `/docs`.

## Frontend Development Boundary

- Local frontend origins allowed: `http://localhost:3000` and `http://127.0.0.1:3000`.
- CORS does not allow credentials, wildcard origins, or non-`Content-Type` headers.
- `GET`, `POST`, and `OPTIONS` are listed as allowed CORS methods to support the planned local frontend; this does not create a POST route. The only application route currently defined is the read-only health route above.
- Local run command from the workspace root: `.\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8765 --no-access-log`.
- The default development base is `http://127.0.0.1:8765`; do not treat it as a production deployment configuration.

## Boundary and Error Behavior

- No request model accepts report bytes, report text, patient identifiers, or clinical values.
- No file upload, interpretation, database, cache, external provider, authentication, authorization, cloud, or AI endpoint is configured.
- The service does not add request-body or response-body logging. The documented local server command disables Uvicorn access logs.
- FastAPI's default `404` and `405` responses apply where applicable. No business-error envelope has been selected because no business API is part of t4.
- Future data routes must be reviewed before implementation; errors and logs must not echo or record report contents or PHI. CORS must not be treated as authentication.
- A production role boundary must not rely solely on UI navigation or client-supplied role labels. The demo role mechanism and production identity provider require separate approved contracts.

## Runtime Verification

- Live `GET /api/v1/health`: HTTP 200; response identified `synthetic-demo`.
- Live `GET /openapi.json`: HTTP 200; exactly one application path, `/api/v1/health`.
- Automated checks additionally verify the 405 response for POST, local-origin CORS, and route inventory.

## Upstream Artifacts Consumed

- `.github/modernize/rearchitecture/plan.md` — demo safety and absence of required legacy API compatibility.
- `.github/modernize/rearchitecture/.metadata/tasks.json#002-application-foundation` — requirement to define a clear frontend/backend boundary.
- `.github/modernize/rearchitecture/artifacts/t1-tester.md#Existing Test Assets and Environment` — evidence that the source prototype has no API, auth, or database.

## Evidence Mapping

- `tasks.json#002-application-foundation.requirements` → API version prefix, typed status response, and documented local CORS boundary.
- `plan.md#Delivery Boundaries and Acceptance` → current route accepts no medical data and does not connect to production services.
- Contract table and boundary clauses → `backend/tests/test_main.py` and live health/OpenAPI probes recorded in `t4-backend-batch-report.yaml`.
