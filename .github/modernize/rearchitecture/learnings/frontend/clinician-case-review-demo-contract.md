# Clinician Case Review Demo Contract

For a synthetic clinician-review UI, use only validated fixed-case API responses and a client-supplied role header that is explicitly not production authentication.

## What Happened

CareLens task `t8` connected the clinician route to t7's fixed list/detail GET endpoints. The component sends only bodyless requests with `X-Demo-Role: clinician`, validates the two approved fixture IDs and response flags, and presents denied responses without parsing or echoing backend error bodies. It explicitly states that production authentication is disabled.

## Takeaway

Keep demo role selection out of user input; send the fixed demo role only to the scoped synthetic endpoint. Validate the response before rendering, show 401/403 as a safe role-denied state, and never describe the header as sign-in, identity, or production authorization.

## History

- 2026-10-29 (CareLens/t8): initial
