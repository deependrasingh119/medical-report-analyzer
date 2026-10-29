# Synthetic Browser Fixtures

When integrated Playwright snippets lack Node's `Buffer`, use short-lived synthetic files outside the workspace for file-picker tests.

## What Happened
In CareLens task t1, `runPlaywrightCode` did not expose `Buffer`, and `setInputFiles` rejected a `Uint8Array`. A temporary synthetic-only file under the OS temp directory worked with `setInputFiles(path)` and was removed after testing. No report content or PHI was used.

## Takeaway
For local file inputs, generate a minimal synthetic fixture in the system temp directory, supply its absolute path to the browser page, and clean it up immediately. Never use real reports or PHI.

## History
- 2026-10-29 (CareLens/t1): initial
