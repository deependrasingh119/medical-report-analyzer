# t2 — Toolchain Preparation

## Summary

Prepared a reproducible local runtime base for the approved Next.js 15/React 19/TypeScript frontend and FastAPI/Python backend. No application source files or approved plan/clarification files were changed. The framework packages remain pending their foundation tasks because no frontend or backend dependency manifests exist yet.

## Target Environment Preparation

- **Status:** READY — runtime/toolchain layer. Application dependencies are pending creation of the approved manifests.
- **Preparation actions:** Verified the installed Node.js/npm toolchain; configured a workspace-local Python virtual environment with the explicitly selected Python 3.11.9 interpreter; repaired the helper-created venv after it selected an incomplete Python 3.13 base; verified interpreter, pip, standard-library imports, and command resolution.
- **Requested target versions:** Next.js 15, React 19, TypeScript (exact version not specified), FastAPI (exact version not specified), Python (exact version not specified).
- **Installed/active versions:** Node.js 22.19.0, npm 11.7.0, Python 3.11.9, pip 24.0.
- **Command-resolution evidence:** `node`, `npm`, and the workspace virtual environment resolved successfully. The verified version commands returned `v22.19.0`, `11.7.0`, and `Python 3.11.9`.
- **Version planned build/test commands will use:** Next.js and TypeScript commands use the installed Node.js 22.19.0/npm 11.7.0. Python build/test commands use the workspace `.venv` at Python 3.11.9.
- **Exact PowerShell activation commands downstream tasks can copy:**
  ```powershell
  . .\.venv\Scripts\Activate.ps1
  node --version
  npm --version
  python --version
  ```
  If script activation is restricted, invoke Python directly with `& ".\.venv\Scripts\python.exe" <args>`.
- **Python package compatibility evidence:** FastAPI's current PyPI metadata lists Python 3.11 support. Next.js 15's official installation documentation requires Node.js 18.18 or later; the published Next.js 15.5.9 package metadata also declares Node `^18.18.0 || ^19.8.0 || >=20.0.0`, which includes the installed Node 22.19.0.
- **Missing tools/dependencies:** No `package.json`, npm lockfile, `requirements.txt`, or `pyproject.toml` exists yet. Therefore Next.js, React, TypeScript, FastAPI, and Uvicorn have not been installed into this workspace. The frontend/backend foundation tasks must create pinned manifests and lockfiles, then install from those files.
- **Blockers:** No runtime blocker for the selected targets. Dependency installation and application-level build/test checks are deferred until the frontend/backend manifests exist. No cloud, production identity, database, or live-AI setup was requested or performed.
- **Setup attempt and recovery:** `appmod-python-setup-env` initially returned “Dependencies may not be installed correctly” and created a venv based on `C:\Python313` (Python 3.13.7) whose standard-library prefix was invalid. Recreated `.venv` using the explicitly selected system Python 3.11.9, reconfigured the workspace to that venv, and verified imports/pip successfully. No project dependency manifest was available for that helper to install.

## Upstream Artifacts Consumed

- `.github/modernize/rearchitecture/plan.md` — read the target frontend/backend stack and its no-cloud/no-production-integration boundaries.
- `.github/modernize/rearchitecture/.metadata/tasks.json` — confirmed task `002-application-foundation` and its build/unit-test expectations.
- `.github/modernize/rearchitecture/clarification-answers.md` — confirmed Next.js 15/React 19/TypeScript and FastAPI/Python choices.
- `.github/modernize/rearchitecture/board.md` — read only to follow task order and identify downstream foundation owners.
- `.github/modernize/rearchitecture/artifacts/project-profile.yaml` — confirmed the initial static-only workspace and lack of an existing package/backend project.

## Evidence Mapping

- `plan.md#Technical Framework` and `clarification-answers.md#F1/B1` → Node/Python runtime selection, compatibility checks, and exact downstream activation instructions in this artifact.
- `tasks.json#002-application-foundation` → framework dependency installs deferred to manifest creation; no production database, identity provider, or cloud resources provisioned.
- `project-profile.yaml#project.structure` → no pre-existing dependency manifests; runtime smoke checks used instead of application builds.

## Test Results

- **Command:** `. .\.venv\Scripts\Activate.ps1; $node = node --version; $npm = npm --version; $python = python --version; $pip = python -m pip --version; $stdlib = python -c "import json, pathlib, ssl, sys; print('stdlib imports OK; ' + sys.version.split()[0])"`
- **Passed:** 5 checks — Node version, npm version, Python version, pip version, and Python standard-library imports.
- **Failed:** 0.
- **Skipped:** 2 application dependency checks (Next.js/React/TypeScript and FastAPI/Uvicorn imports/builds), because the respective manifests do not yet exist.
- **Result:** Exit code 0; active command resolution matched the versions recorded above.

## Changed/Generated Files

- `.venv/` — workspace-local Python 3.11.9 virtual environment prepared for subsequent backend dependency installation.
- `.github/modernize/rearchitecture/artifacts/t2-devops.md` — this task result.
- `.github/modernize/rearchitecture/team/devops/log.md` — private DevOps session log.
- `.github/modernize/rearchitecture/learnings/devops/runtime-toolchain-selection.md` — reusable runtime-selection/setup learning.

Plan, task, and clarification artifacts were not modified. The workspace has no Git repository, so no Git status/diff is available.

## References

- Next.js 15 installation/system requirements: https://nextjs.org/docs/15/app/getting-started/installation
- Next.js 15.5.9 package engine metadata: https://registry.npmjs.org/next/15.5.9
- FastAPI package metadata and Python classifiers: https://pypi.org/pypi/fastapi/json
