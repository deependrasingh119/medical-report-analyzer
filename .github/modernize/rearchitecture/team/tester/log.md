## [t1] Captured CareLens static prototype behavior
- Codebase/domain discoveries: Existing app is static HTML/CSS/JavaScript with no backend, persistent report data, auth, test runner, or integration suite. Report picker reads file metadata only and review always displays a not-connected notice. UI clinician area is informational only.
- Wrong assumptions and corrections: `20 MB` is implemented as 20 MiB (`20 * 1024 * 1024`). Current file validation accepts a matching MIME type OR matching filename extension.
- Debugging dead-ends and what actually worked: Browser `setInputFiles` did not expose Node `Buffer`; a short-lived synthetic file created under the OS temp directory enabled safe picker verification and was deleted afterward.
- Techniques/patterns worth reusing: Record source hashes rather than copying source content into baseline artifacts; use synthetic-only fixtures for browser selection. Distinguish source-level inspection from runtime evidence and manual browser observation from automated tests.
- Learnings consumed: [(none)]
