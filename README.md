# CareLens

CareLens is a responsive web prototype for helping patients and care teams make medical reports easier to discuss. The first workflow is designed around report literacy and preparing questions for a clinician—not diagnosing conditions or recommending treatment.

## Run locally

Open `index.html` in a browser. No package installation or build step is required.

## Prototype limitations

- The report picker validates a file's type and size, then displays its name. It does not open, read, upload, or save the file.
- The review action explains that report analysis is not connected. No medical interpretation is generated.
- The reports and clinician areas are interface previews; they do not store or share patient information.
- Do not use real patient information with this prototype.

Before handling real reports, build and review a secure backend, authentication and authorization, explicit consent, retention and deletion controls, and a clinically validated explanation workflow. Keep medical interpretation and care decisions with qualified clinicians, and assess applicable privacy, security, and medical-device requirements for the regions where the product will be offered.

## Modernized synthetic demo

The Next.js and FastAPI applications are separate local development processes:

1. Install the pinned frontend packages with `npm ci`, then run `npm run dev`.
2. In another terminal, run `.\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8765 --no-access-log`.
3. Open `http://localhost:3000`. The demo API health contract is at
   `http://127.0.0.1:8765/api/v1/health`; its fixed illustrative example is at
   `http://127.0.0.1:8765/api/v1/demo/explanation`.

The explanation endpoint returns only a deterministic source-code fixture. It
has no request body, file-upload route, user-report input, persistence, live AI,
or production identity integration. Do not select or submit real medical files
or enter personal health information. All example content is synthetic and
illustrative; it is not diagnosis, triage, or treatment advice, and a qualified
clinician must review real reports.
