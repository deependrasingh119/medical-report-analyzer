## [t6] Implementing the patient preparation demo
- Codebase/domain discoveries: t3 frontend source was present without a t3 artifact index; t5 exposes one bodyless fixed fixture at `/api/v1/demo/explanation` and allows local frontend origins on port 8765 API/port 3000 web.
- Wrong assumptions and corrections: the Vitest alias issue was not the only test-runner problem; Vite also needed automatic JSX runtime and explicit Testing Library cleanup to prevent accumulated DOM between test files.
- Debugging dead-ends and what worked: the browser helper could not launch because Chromium was not installed; use focused jsdom tests and the live curl endpoint probe meanwhile, and leave visual E2E to the validation phase.
- Techniques/patterns worth reusing: use only server-fixed strings and checkbox selection for page-local summaries; keep `fetch` GET bodyless, validate the fixture contract, and avoid persisting or submitting choices.
- Learnings consumed: [backend/api-boundary-contract]

## [t8] Implementing clinician synthetic case review
- Codebase/domain discoveries: the t7 API returns two fixed IDs with identical case summary/detail fields; both read-only GETs require the exact `X-Demo-Role: clinician` header. The existing app shell already exposes the clinician route and global keyboard focus treatment.
- Wrong assumptions and corrections: the list-level plural data label is not rendered as a separate field; the UI labels each case directly. Test assertions should target visible case labels and allow repeated production-auth-disabled copy in the banner and denied state.
- Debugging dead-ends and what worked: the first focused test run had assertion-query mismatches, which were fixed; the first parallel build/typecheck overlapped generated `.next` types and found a nullable state closure. Capturing the narrowed case ID and running build before the final typecheck resolved it.
- Techniques/patterns worth reusing: validate the fixed synthetic IDs and contract fields before rendering; send only bodyless GET requests with the exact demo header; never parse/echo authorization error bodies; use semantic button selection with `aria-pressed` and status/alert regions.
- Learnings consumed: [frontend/safe-synthetic-preparation-demo, frontend/vitest-next-js-config, backend/api-boundary-contract, backend/clinician-demo-role-boundary]
