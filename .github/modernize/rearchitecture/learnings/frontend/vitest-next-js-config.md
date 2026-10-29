# Vitest Next.js Configuration

Next.js TypeScript path aliases and JSX settings need explicit Vitest configuration in this workspace.

## What Happened

CareLens task `t6` confirmed the existing `@/lib/utils` failure, then resolved the alias in `vitest.config.ts`. Vite also required the automatic JSX runtime, and explicit Testing Library cleanup prevented DOM from accumulating because Vitest globals are not enabled.
_Discovered in CareLens during task `t6` while restoring and extending the frontend test suite._

## Takeaway

When Vitest consumes a Next.js project configured with `jsx: "preserve"` and `@/*` TypeScript paths, map the alias in Vite, set `esbuild.jsx` to `automatic`, and register Testing Library `cleanup` in setup when global test hooks are not exposed.

## History

- 2026-10-29 (CareLens/t6): initial
