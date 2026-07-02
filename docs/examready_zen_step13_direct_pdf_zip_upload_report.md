# ExamReady Zen — Step 13: Direct PDF/ZIP Upload Report

This report summarizes the design, endpoints, security protection gates, UI layout, and usage instructions for the newly implemented Direct PDF/ZIP Upload feature.

---

## 1. Upload Workflow

1.  **Selection**: The administrator selects a local `.pdf` or `.zip` file from the dashboard upload widget.
2.  **Validation**: Both backend and frontend validate file types (allowing only PDF and ZIP) and enforce a max file size limit of 10MB.
3.  **Sanitization & Deduping**: Filenames are sanitized of special characters. If a filename collision exists in the upload folder, a numeric suffix (e.g. `_1`) is appended.
4.  **Local Storage**: Files are saved to `data/uploads/exams/`.
5.  **Ingestion & Registry**: The `exam_importer` processes the saved file (extracts ZIP archives, parses metadata, extracts question nodes, writes JSON draft to `imported/`, and adds it to the registry).
6.  **Safety Curation Block**: The status of newly uploaded files is forced to `imported_draft` or `scanned_pdf_needs_review`, keeping them completely isolated from active student diagnostics until manually reviewed and approved.

---

## 2. Backend API Endpoint

*   **`POST /exam-bank/upload`**:
    *   **Request Type**: `multipart/form-data`
    *   **Parameters**: `file: UploadFile`
    *   **Response Payload**: Returns `filename`, `saved_path`, `files_found`, `exams_imported`, `duplicates_skipped`, `scanned_manual_review_needed`, `errors`, and `imported_exam_ids`.
    *   **Status Codes**:
        *   `200 OK`: File uploaded and ingested successfully.
        *   `400 Bad Request`: Rejected due to invalid file extension, empty files, or size > 10MB.

---

## 3. Frontend UI Widget

*   **`lib/examreadyZenApi.ts`**:
    *   `uploadExamFile(file)`: Sends a `multipart/form-data` fetch POST request to the upload endpoint.
*   **`app/examready-zen/exam-bank/page.tsx`**:
    *   Added a new **"Uploader un examen PDF/ZIP"** widget card.
    *   Stacked next to the local folder import form in a 2-column layout.
    *   Upon successful upload:
        *   Renders a success banner detailing files found, duplicates skipped, errors, and imported IDs.
        *   Provides clickable **"Réviser {ID} ➡️"** links for all newly registered files to navigate straight to their curation workspaces.
        *   Refreshes the registry data table.

---

## 4. Security Rules

*   **Zip Slip Protection**: Re-verified that `safe_extract_zip` ensures target paths reside strictly inside the temp directories, blocking directory traversal hacks.
*   **File Execution Ban**: Uploaded files are strictly stored and read as data binaries, never executed.
*   **Automatic Curation Quarantine**: All direct uploads are quarantined by default (needs verification flags set to `true` and status set to draft/review).

---

## 5. Manual Test Instructions

1.  Start the FastAPI backend (`make serve` on port `8030`).
2.  Start the Next.js frontend (`npm run dev` on port `3000`).
3.  Open the Exam Bank Dashboard at `http://localhost:3000/examready-zen/exam-bank`.
4.  Locate the card **"Uploader un examen PDF/ZIP"**.
5.  Click the file selector and try uploading a `.txt` file. Confirm it gets rejected with an alert.
6.  Select a valid `.pdf` or `.zip` Moroccan regional exam file (e.g. `math_anfa_2026.pdf`).
7.  Click **Uploader**. Confirm the success banner pops up, listing the new exam ID (`math_anfa_2026`).
8.  Verify the new entry appears in the registry table as `imported_draft`.
9.  Click the review link in the banner to access `http://localhost:3000/examready-zen/exam-bank/math_anfa_2026` to cure and approve the exam.

---

## 6. Next Step Recommendation

*   **OCR + Topic Classification + Solution Matching Workspace**: Upgrade the review detail workspace to support interactive manual OCR correcting, question editing, topic tagging drop-downs, and correction solution additions.
