# Runtime Toolchain Selection

CareLens uses Node.js 22.19.0 for the Next.js 15 frontend and a workspace-local Python 3.11.9 venv for the FastAPI backend.

## What Happened

During CareLens task `t2`, the workspace had no frontend/backend dependency manifests. Node.js 22.19.0 satisfies the official Next.js 15 minimum of Node 18.18. FastAPI's PyPI metadata lists Python 3.11 support. The generic Python setup helper initially based `.venv` on an incomplete Python 3.13 installation; recreating the environment with the explicit Python 3.11.9 executable resolved the invalid prefix and passed interpreter, pip, and standard-library checks.

## Takeaway

On this Windows workspace, activate Python with `. .\.venv\Scripts\Activate.ps1` and verify the resolved interpreter before installing dependencies. Keep application packages out of the environment until their pinned manifests and lockfiles exist; then install from those files. Do not rely on the default Python launcher when it selects the incomplete `C:\Python313` installation.

## History

- 2026-10-29 (`CareLens/t2`): initial
