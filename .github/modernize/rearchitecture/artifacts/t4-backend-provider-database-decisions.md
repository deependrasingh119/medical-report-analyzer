# t4 — Deferred Identity and Database Decisions

## Decision Status

**Deferred.** No database vendor, schema, managed identity provider, or production hosting target is selected or provisioned. The t4 API foundation is stateless and has no authentication or authorization mechanism. These are explicit non-decisions, not production recommendations.

## Current Evidence and Constraints

- The approved plan states there is no existing backend, database, or authentication implementation and requires provider selection to be deferred.
- The baseline artifact records no persistent data store or account provider in the static prototype.
- The clarification answer asking to preserve an existing authentication mechanism could not be applied because the baseline found none.
- User-approved scope prohibits production auth, database, cloud, live AI, real report processing, and real PHI in this delivery.

## Deferred Decision Register

| Decision | Current state | Required evidence before selection |
|---|---|---|
| Data persistence and database provider | No database dependency or connection is configured; the t4 API stores no state. | Approved data classification and minimum model; privacy/threat review; access-control and encryption requirements; retention/deletion rules; backup/restore and audit needs; regional/legal constraints; operational cost and migration plan. |
| Managed identity provider | No login, token validation, account store, role check, or identity-provider dependency is configured. | Approved patient/clinician/admin role model; threat and privacy review; authorization test cases; provider capability and deployment assessment; session/token lifecycle and recovery requirements. |
| Production hosting and secrets | No cloud deployment, production configuration, or secrets are provisioned. | Approved operational owner, environment, secret-management approach, monitoring policy, incident response, and deployment/security review. |

## Activation Gates

1. Keep all demo data synthetic and in-memory/local; do not collect or transmit real patient records.
2. Obtain explicit privacy and security approval for the proposed identity, data model, storage, access, logging, and retention design.
3. Obtain clinical validation before enabling real report interpretation or operational AI.
4. Approve an implementation plan and tests for consent, least-privilege authorization, retention/deletion, and incident handling before production-data work.
5. Revisit these decisions with the designated project owner and relevant security, privacy, clinical, and data stakeholders; this document does not approve any provider.

## Upstream Artifacts Consumed

- `.github/modernize/rearchitecture/plan.md#Technical Framework` — database remains undecided and managed identity is deferred.
- `.github/modernize/rearchitecture/plan.md#Delivery Boundaries and Acceptance` — production data, auth, and AI require review/validation gates.
- `.github/modernize/rearchitecture/clarification-answers.md#B3/B4/G1/G2` — submitted data and identity responses and safety constraints.
- `.github/modernize/rearchitecture/artifacts/t1-tester.md#Existing Test Assets and Environment` — evidence that the prototype has no auth, database, or backend.

## Evidence Mapping

- `plan.md#Technical Framework` and `clarification-answers.md#B3` → database choice remains deferred; no database package or connection exists in `backend/`.
- `plan.md#Delivery Boundaries and Acceptance` and `clarification-answers.md#B4` → provider selection remains deferred; no authentication implementation exists in `backend/`.
- `t1-tester.md#Existing Test Assets and Environment` → document records absence of a pre-existing mechanism rather than claiming preservation.
