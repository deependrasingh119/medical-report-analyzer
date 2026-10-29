---
schema: clarification-answers/v1
status: submitted
generated_at: "2026-10-29T11:21:26.343Z"
scope: [frontend, backend, generic]
questions_file: clarification-questions.json
---

# Rearchitecture Clarification Answers

## 🖥️ Frontend

- **F1** Which frontend framework and version should the upgraded web app use?
  - answer: Next.js 15 (React 19, TypeScript)
  - source: user
- **F2** Which component library or design approach should the frontend use?
  - answer: shadcn/ui + Tailwind CSS
  - source: user
- **F3** Share the name or URL of the app you want CareLens compared with, plus screenshots, a screen recording, or a staging link for the screens and workflows you want matched. If you meant a well-known product, name it and say which parts to compare (for example report upload, AI explanation, patient dashboard, clinician dashboard, or visual design).
  - answer: https://www.healthnivaran.in/
  - source: user
- **F4** Should we use the existing CareLens visual style as the starting design system, or do you have brand guidelines, design tokens, or a reference design to follow?
  - answer: Use existing CSS custom properties and styles.css as the starting design tokens
  - source: user
- **F5** Which accessibility standard should the UI target?
  - answer: WCAG 2.2 AA
  - source: user
- **F6** Which browsers and versions should the web app support?
  - answer: Modern evergreen browsers, latest 2 versions
  - source: user
- **F7** Confirm the responsive strategy for mobile phones, tablets, and desktop screens.
  - answer: Responsive web for mobile, tablet, and desktop
  - source: user
- **F8** Which languages should the first version support?
  - answer: preserve current locales; keep existing i18n library if present
  - source: user
- **F9** Do you have a preference for handling UI and server data state?
  - answer: preserve existing pattern if identifiable; otherwise recommend minimal (component state + server-state library)
  - source: user
- **F10** Do you prefer a specific routing library or strategy?
  - answer: use the de-facto router for the chosen target framework
  - source: user

## ⚙️ Backend

- **B1** Which backend framework and runtime should power APIs, authentication, report workflows, and AI integration?
  - answer: FastAPI (Python)
  - source: user
- **B2** There is no backend API in the current prototype. What compatibility policy should apply to the new API?
  - answer: can break
  - source: user
- **B3** The prototype has no database or saved report data. How should the new app handle database design and any migration?
  - answer: TBD / assess in research phase
  - source: user
- **B4** Do you have a preferred identity provider or authentication approach for patients, clinicians, and administrators?
  - answer: preserve existing auth mechanism; detect from codebase
  - source: user
- **B5** What service targets should the backend meet (for example availability, response time, and expected users)? If this is not known yet, say so.
  - answer: match current production baseline; no regression
  - source: default applied

## 📋 General

- **G1** What measurable outcome would make this build successful? Include the expected depth of feature parity with your comparison app and whether this is a demo, MVP, or production launch.
  - answer: Deliver a responsive patient and clinician product with secure accounts and role-based dashboards, a privacy-reviewed backend, and carefully bounded AI-assisted report explanations; compare the agreed workflows with the reference app. Before real patient data is handled, require appropriate privacy/security controls and clinical validation. Define passing accessibility, security, and end-to-end checks for the agreed release scope.
  - source: user
- **G2** What must be excluded from this build? In particular, should production handling of real reports or patient-facing AI interpretation wait until privacy, security, and clinical validation are complete?
  - answer: no explicit exclusions; agent will infer from project structure
  - source: default applied
- **G3** The current prototype has no automated test suite. What test policy should apply as the project grows?
  - answer: must pass
  - source: user
- **G5** Please name or link the app you mean by 'other app' and describe what to compare (features, screens, user workflows, dashboard, AI behavior, visual design). Add any other requirements, privacy/regulatory constraints, dependencies, or operational limits here.
  - answer: None beyond the decisions listed in this specification.
  - source: user
