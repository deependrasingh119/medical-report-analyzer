## [t4] Established the FastAPI demo foundation
- Codebase/domain discoveries: The static prototype has no API/auth/database; Python 3.11.9 is already prepared in the workspace `.venv`.
- Wrong assumptions and corrections: The clarification asked to preserve existing auth, but the verified baseline contains no auth; provider selection stays deferred.
- Debugging dead-ends and what actually worked: Starlette's synchronous `TestClient` emitted an HTTPX deprecation warning with the selected current FastAPI dependency set; using HTTPX `ASGITransport` avoided that adapter and exercised the app without a network server.
- Techniques/patterns worth reusing: Keep the foundational API contract read-only and synthetic; verify the live route separately; restrict local CORS and disable Uvicorn access logging in the documented development command.
- Learnings consumed: [devops/runtime-toolchain-selection]

## [t7] Added clinician synthetic case-review API
- Codebase/domain discoveries: The existing `/api/v1` health and explanation routes are stateless GET endpoints; local CORS needed the narrowly scoped `X-Demo-Role` header for the clinician demo UI.
- Wrong assumptions and corrections: A `Header(default=None)` dependency documents the role as optional in OpenAPI. Reading it from `Request` and declaring the OpenAPI header explicitly preserves a deliberate 401 response for missing role while documenting the header as required.
- Debugging dead-ends and what actually worked: The first OpenAPI test incorrectly expected no parameters; the API correctly needs a role header. The fixed contract asserts required role and case-id path parameters and no request bodies.
- Techniques/patterns worth reusing: Put deterministic fixture definitions, response models, role boundary, and read-only routes in one backend feature module. Check authorization before looking up case IDs; return fixed non-echoing error details. State explicitly that a client-supplied demo role is not production authentication.
- Learnings consumed: [backend/api-boundary-contract]
