# Local synthetic PDF OCR experiment

This is an isolated development experiment, not a production feature. It accepts
only loopback requests when explicitly enabled, requires confirmation that the
PDF is fictional, limits files to 10 MB and 20 pages, uses local Tesseract OCR,
and does not call OpenAI or persist uploaded PDFs. Temporary server-side files
are removed when processing ends. The OCR response includes temporary page
previews and word positions for comparison with the source; browser memory and
local development logs are not a production privacy boundary.

## Setup on Windows

1. Install Tesseract OCR. For example, with WinGet:

   ```powershell
   winget install --id UB-Mannheim.TesseractOCR --exact --source winget
   ```

2. In the PowerShell window where you will run the backend, add the default
   installation location to PATH and confirm it works:

   ```powershell
   $env:PATH = "C:\Program Files\Tesseract-OCR;$env:PATH"
   tesseract --version
   ```

   Adjust the path if you installed Tesseract elsewhere. The prototype uses
   English (`eng`) language data.

3. Start the frontend:

   ```powershell
   npm run dev
   ```

4. In another PowerShell terminal, configure PATH, explicitly enable the
   loopback-only OCR route, and start FastAPI:

   ```powershell
   $env:PATH = "C:\Program Files\Tesseract-OCR;$env:PATH"
   $env:CARELEN_ENABLE_LOCAL_SYNTHETIC_OCR = "1"
   .\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8765 --no-access-log
   ```

5. Open `http://localhost:3000/clinicians/extract`, choose a fictional PDF,
   confirm it contains no personal information, and select **Transcribe locally**.

The endpoint returns 404 unless `CARELEN_ENABLE_LOCAL_SYNTHETIC_OCR=1` is set
for the backend process and rejects non-loopback clients. Do not expose this
development API to the internet or use it for real reports. OCR text and
confidence values are not validated for clinical use. The project still lacks
production authentication, authorization, managed storage, deletion and
retention operations, privacy/security review, and clinical validation.
