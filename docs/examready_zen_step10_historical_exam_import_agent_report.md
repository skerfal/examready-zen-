# ExamReady Zen — Historical Exam Import Automation System (Step 10 Report)

This document details the architecture, usage, and safety guidelines for the Historical Exam Import Automation System integrated into the `examready-zen-api` backend.

---

## 1. Purpose

The import automation system provides a local pipeline to scan, extract, parse, and registry-track historical exam files (PDFs and ZIPs) from regional provincial administrations. By scanning files and matching filenames against curricular patterns, the system automatically builds draft JSON exam configurations and populates the master registry, reducing manual configuration overhead.

---

## 2. Ingestion Folder Structure

*   `app/exam_importer.py`: Scanning, metadata parsing, PDF text extraction (using `fitz` / `PyPDF2` fallbacks), and draft JSON generator.
*   `app/exam_registry.py`: Central registration utility managing `exam_registry.json` and preventing duplicate file ingestions.
*   `data/historical_exams/exam_registry.json`: JSON key-value store mapping `exam_id` to ingestion status and metadata.
*   `data/historical_exams/imported/`: Output folder containing generated draft exam configuration JSONs.
*   `scripts/import_historical_exams.py`: Command-line tool to process file or folder paths.
*   `tests/test_exam_importer.py`: Isolated unit test suite validating duplicate checks, metadata extraction, Zip Slip security, and scanned fallbacks.

---

## 3. Supported Input Types

1.  **Selectable PDF Documents (`.pdf`)**: Exam papers containing searchable text. If the metadata matches, these are registered under `"text_extracted"` and their text is parsed into draft question objects.
2.  **Scanned PDF Documents (`.pdf`)**: Non-selectable image-based documents. If character extraction returns 100 characters or less, they are safely registered under `"scanned_pdf_needs_manual_review"` with `needs_manual_verification: true` without hallucinating question content.
3.  **Correction/Solution Documents**: If correction keywords (`correction`, `corrigé`, `solution`, etc.) are detected, the status is set to `"solution_file_detected"`.
4.  **ZIP Archives (`.zip`)**: Safe folder extractions. The script parses them, validates extracted paths to protect against **Zip Slip** vulnerabilities, and recursively processes internal PDFs.

---

## 4. Command Line Usage

Execute the import script by providing the path to a folder or file:

```bash
# Ingest all files from a directory
python scripts/import_historical_exams.py --input "C:\path\to\morocco_exams_2023"

# Ingest a single PDF file
python scripts/import_historical_exams.py --input "C:\path\to\math_rabat_2022.pdf"
```

### CLI Output Example:
```text
Found 3 file(s) to process.

Processing: math_rabat_2022.pdf...
Processing: scanned_ifrane_2020.pdf...
Processing: casablanca_exams_zip.zip...
  Zip archive detected. Extracting...
  Extracted 1 PDF(s).
    Ingesting: math_casablanca_2021.pdf...

==============================
Historical Exam Ingestion Report
==============================
Files found:                 3
Exams imported:              3
Duplicates skipped:          0
Scanned/manual review needed: 1
Errors encountered:          0
==============================
```

---

## 5. Security and Safety Rules

*   **Zip Slip Mitigation**: Target directory validation is executed during member extraction:
    ```python
    target_path = os.path.abspath(os.path.join(abs_temp_dir, filename))
    if not target_path.startswith(abs_temp_dir):
        continue # Skip insecure file extraction
    ```
*   **Anti-Hallucination Guardrails**: For scanned PDFs, no questions are parsed or invented. The question list remains empty and marked for human verification.
*   **Curated Data Protection**: Curated exam files placed in `data/historical_exams/` (such as `ifrane_2023_math.json`) are protected and will never be overwritten.

---

## 6. Manual Review Workflow

When an exam has status `"scanned_pdf_needs_manual_review"` or `"missing_metadata"`:
1.  Check `data/historical_exams/exam_registry.json` for flagged items (`"needs_manual_verification": true`).
2.  Open the corresponding draft file in `data/historical_exams/imported/{exam_id}.json`.
3.  Copy/paste the text manually or extract it using OCR tools, filling in the `"questions"` list with domain-aligned topics.
4.  Copy the finalized JSON file to the main folder `data/historical_exams/` and update registry status to `"text_extracted"`.

---

## 7. Next Steps
*   **Integrate Local OCR (Tesseract / EasyOCR)**: Incorporate a local python OCR step for scanned PDFs to automatically transcribe questions.
*   **Topic Classification Agent**: Connect a local classification agent to automatically map extracted question text to the 38 Math 6AEP topic IDs.
