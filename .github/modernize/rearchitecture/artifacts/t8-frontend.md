# t8 — Clinician Dashboard and Case Review

## Summary

Implemented the clinician demo route as a responsive, read-only synthetic case list and detail review. The frontend calls only the fixed t7 endpoints, includes `X-Demo-Role: clinician` on each bodyless GET, validates the synthetic response envelope and the two approved fixture IDs, and provides safe loading, retry, and role-denied states. The page labels cases fictional/synthetic, requires clinician review, and states that the demo header is not production authentication and production authentication is disabled.

No backend code, real report input, PHI/free-text fields, patient sharing, clinical decision logic, diagnosis, triage, or treatment recommendations were added.

## Deliverables

- [t8-frontend-batch-report.yaml](./t8-frontend-batch-report.yaml) — structured task traceability, required endpoints, test results, and live contract probes.
- [checkpoints/t8-tasks-to-impl.yaml](./checkpoints/t8-tasks-to-impl.yaml) — task-specific implementation checkpoint.
- `components/clinician-dashboard.tsx` — GET-backed fixed case list/detail review and error/role-denied handling.
- `app/clinicians/page.tsx` — mounts the clinician dashboard inside existing navigation.
- `app/globals.css` — responsive list/detail layout, focusable controls, and status/error presentation using existing CareLens tokens.
- `tests/clinician-dashboard.test.tsx` — API header/path/bodyless assertions, case selection, synthetic boundaries, and 401/403 UI coverage.

## Upstream Artifacts Consumed

- `.github/modernize/rearchitecture/artifacts/t7-backend.md` — backend scope, fixed read-only fixtures, role behavior, and remaining production gates.
- `.github/modernize/rearchitecture/artifacts/t7-backend-api-contract.md#Demo Role Boundary` and `#Response Shape` — exact header, route paths, schema, error behavior, and non-production auth boundary.
- `.github/modernize/rearchitecture/artifacts/t7-backend-batch-report.yaml#endpoint_probes` — prior backend route and role verification evidence.
- `.github/modernize/rearchitecture/artifacts/t6-frontend.md` and `.github/modernize/rearchitecture/artifacts/t6-frontend-batch-report.yaml` — existing frontend route/style/test patterns and safe synthetic workflow boundary.
- `.github/modernize/rearchitecture/.metadata/tasks.json#005-clinician-demo-workflow.requirements` — approved synthetic clinician list/detail scope and authorization responsibility.
- `.github/modernize/rearchitecture/plan.md#Delivery Boundaries and Acceptance` — synthetic-only delivery, no real data, and no clinical decision behavior.
- `.github/modernize/rearchitecture/clarification-answers.md#F5/F7` — WCAG 2.2 AA and mobile/tablet/desktop expectations.
- `.github/modernize/rearchitecture/learnings/frontend/safe-synthetic-preparation-demo.md`, `vitest-next-js-config.md`, `backend/api-boundary-contract.md`, and `backend/clinician-demo-role-boundary.md` — safe synthetic UI, test conventions, API boundary, and demo-role guidance.
- `components/patient-preparation.tsx`, `tests/patient-preparation.test.tsx`, `components/app-shell.tsx`, and `app/globals.css` — source patterns for the API base, accessible shell, existing styles, and test setup.
- `.github/modernize/rearchitecture/board.md` — read-only task order context.

## Evidence Mapping

- `tasks.json#005-clinician-demo-workflow.requirements` → `components/clinician-dashboard.tsx` and `tests/clinician-dashboard.test.tsx` → fixed synthetic case list/detail, review questions, read-only flow, and no text/file controls.
- `t7-backend-api-contract.md#Endpoints` and `#Response Shape` → `components/clinician-dashboard.tsx` and `tests/clinician-dashboard.test.tsx` → exact list/detail URLs, `X-Demo-Role: clinician`, bodyless GETs, schema validation, and live 200 probes.
- `t7-backend-api-contract.md#Demo Role Boundary` → role-denied UI and test cases → 401/403 states are understandable, backend response bodies are not echoed, and UI explicitly says the header is not authentication.
- `t6-frontend.md` and `clarification-answers.md#F5/F7` → clinician route and responsive CSS → consistent CareLens shell/tokens, semantic sections/lists/buttons, selected state, visible global focus style, and single-column narrow layout.
- `plan.md#Delivery Boundaries and Acceptance` → safety copy and tests → synthetic-only content, clinician review required, no sharing, and no diagnosis, triage, or treatment recommendation.

## Test Results

- Command: `npm test`
- Passed: 10
- Failed: 0
- Skipped: 0
- Failures: none.
- Command: `npm run lint` — PASS (exit code 0).
- Command: `npm run typecheck` — PASS (exit code 0).
- Command: `npm run build` — PASS (exit code 0; Next.js 15.5.28).
- Focused command: `npm test -- tests/clinician-dashboard.test.tsx` — PASS (4 tests).
- Live local API probes: clinician list 200; clinician detail 200; missing role 401; patient role 403.

## Validation Notes and Remaining Gates

- Next.js warned that an existing parent-directory package lockfile was selected as the tracing root; the parent file was not modified.
- Browser-rendered responsive/WCAG automation was not run in this task. The t6 artifact records that Playwright Chromium is unavailable; visual viewport and automated accessibility checks remain for downstream validation.
- `X-Demo-Role` is forgeable and only a demo boundary. Production authentication is disabled; no real patient access or sharing is enabled.
