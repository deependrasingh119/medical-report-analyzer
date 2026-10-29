# Modernization Plan: CareLens Patient and Clinician Report Assistance

**Project**: CareLens

## Technical Framework

- **Current state**: Static HTML/CSS/JavaScript prototype (`index.html`,
  `styles.css`, `app.js`); no package manifest, backend, database, authentication,
  tests, or integrations.
- **Target frontend**: Next.js 15, React 19, TypeScript, shadcn/ui, and Tailwind
  CSS. Use CareLens's existing visual style as the starting point.
- **Target backend**: FastAPI with Python. No existing API compatibility is
  required.
- **Data and identity**: Database strategy remains undecided pending assessment.
  No production persistence or identity provider currently exists; defer provider
  selection to a managed identity solution and document the decision before
  enabling real accounts or patient data.
- **Quality targets**: Responsive mobile, tablet, and desktop experiences;
  WCAG 2.2 AA; modern evergreen browsers; minimal state management; passing
  automated tests.

## Overview

Expand CareLens from a static report-literacy prototype into a patient and
clinician assistance application. Preserve its approachable visual language
while introducing a maintainable web application and backend foundation,
patient report-preparation workflows, and clinician-facing case review.

Use synthetic/demo data and stubbed AI only in this delivery. The report
selection flow must not upload, persist, or interpret real medical files. AI
content must be clearly labeled as illustrative, bounded to explaining
synthetic report data and preparing clinician questions, and must not diagnose
or recommend treatment. Do not enable real patient data or real AI
interpretation until privacy/security review and clinical validation are
approved.

## Reference Product Comparison

The public Health Nivaran site describes an AI symptom conversation, report
upload and explanation, a one-page consultation-preparation summary, virtual
consultations, health goals, mental-wellness support, and digital prescriptions
and follow-ups. For CareLens, the directly relevant benchmark is the
patient-to-clinician preparation journey: provide context, organize report
information, and prepare a concise summary and questions for a clinician.
Relevant workflow ideas may inform the demo experience; this plan does not
assume Health Nivaran's private product behavior or APIs, and does not promise
feature parity. Telehealth, mental-wellness services, health-goal tracking,
prescribing, and pharmacy integrations are not included in this scope.

## Migration Impact Summary

| Application | Current | Target | Authentication | Comments |
|---|---|---|---|---|
| CareLens | Static browser prototype | Next.js frontend and FastAPI backend | Managed provider decision deferred | Demo-only; no real PHI |

## Delivery Boundaries and Acceptance

- Implement demo patient and clinician experiences using synthetic fixtures.
- Provide role-aware navigation and authorization boundaries, with provider
  integration kept gated until an identity provider is selected and reviewed.
- Keep report selection local to the demo; do not send or store uploaded files.
- Use a deterministic stub for explanations; show clear safety language and
  clinician-review boundaries.
- Do not add a production database or persist patient data while the database
  strategy and privacy requirements remain unresolved.
- Require a privacy/security review and clinical validation before enabling
  real patient information or operational AI interpretation.
- Verify the changed workflows with unit/API and end-to-end checks, responsive
  behavior, and WCAG 2.2 AA accessibility checks. Security checks must pass
  before any production-data gate can be considered.
- Do not deploy or provision cloud infrastructure in this plan; deployment
  target and operational environment were not requested.

## Open Questions & Questionnaire

- [x] Q: What frontend and backend stack should be used? → A: Next.js 15,
  React 19, TypeScript, shadcn/ui, Tailwind CSS, and FastAPI/Python.
- [x] Q: Is existing API compatibility required? → A: No.
- [x] Q: What is the database strategy? → A: TBD after assessment; do not
  persist real patient data until selected and reviewed.
- [x] Q: Is authentication already present, and what is the direction? →
  A: No existing auth; defer selection/integration of a managed provider.
- [x] Q: What product should inform the comparison? → A: Health Nivaran's
  publicly described patient-preparation workflow; no API or parity assumption.
- [x] Q: What design, device, accessibility, browser, state, and test targets
  apply? → A: Start with CareLens's existing style; responsive
  mobile/tablet/desktop; WCAG 2.2 AA; modern evergreen browsers; minimal state
  management; tests must pass.
- [x] Q: What must be true before real patient data or AI interpretation is
  enabled? → A: Privacy/security review and clinical validation must be
  approved; use synthetic data and stubbed AI before then.
