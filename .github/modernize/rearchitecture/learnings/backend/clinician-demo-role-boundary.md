# Clinician Demo Role Boundary

Use a narrowly documented client-supplied role header only as a synthetic demo boundary, never as production authentication.

## What Happened

CareLens task `t7` adds fixed, read-only clinician case fixtures. FastAPI reads `X-Demo-Role` in a dependency, returns a fixed 401 when missing and a fixed 403 for every other value, and checks role before case lookup. OpenAPI documents the header as required. This avoids reflecting invalid role values while preserving missing-role status behavior. Local CORS allows this header only for the existing localhost origins, without credentials.

## Takeaway

For static synthetic role demonstrations, accept only the exact expected role, reject missing and other roles with fixed non-echoing messages, and authorize before resource lookup. Explicitly label the mechanism as non-production; it is forgeable and does not establish identity. Do not extend it to real users, accounts, tokens, patient data, or production access control.

## History

- 2026-10-29 (CareLens/t7): initial
