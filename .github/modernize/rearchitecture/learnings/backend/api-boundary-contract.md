# API Boundary Contract

Keep the CareLens demo API versioned, explicitly synthetic, and separate from any future data-bearing workflow until that feature's contract and privacy boundary are approved.

## What Happened

For CareLens task `t4`, the approved plan required a FastAPI foundation and deferred identity/database decisions but supplied no architecture artifact or feature endpoint schemas. Implemented only `GET /api/v1/health`, restricted CORS to local frontend origins without credentials, and recorded that no upload, PHI, persistence, authentication, or AI route exists. Contract and method/CORS behavior are tested with HTTPX `ASGITransport`.

## Takeaway

For later CareLens API work, preserve `/api/v1` and negotiate each feature endpoint in its assigned task. Never treat CORS as authorization. Do not log request/response bodies or echo report values in errors. Keep production identity, storage, and AI disabled until their review gates pass.

## History

- 2026-10-29 (CareLens/t4): initial
