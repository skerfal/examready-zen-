# Kaggle Capstone Submission Summary — ExamReady Zen

## 1. Project Title
**ExamReady Zen — Agentic Math Exam Coach for 6AEP Students**

---

## 2. Summary
ExamReady Zen is a local-first, privacy-respecting agentic exam coach designed to help Moroccan 6AEP (6th grade primary) students prepare for their regional standardized math examinations. The system automates the ingestion of raw, noisy historical exam sheets (PDFs and ZIP archives), handles scanned image documents using local OCR fallback, extracts and classifies questions to curriculum topics, matches expected answers from correction sheets, and guides students with immediate grading, precision warnings, and illustrated illustrated lessons.

---

## 3. Why It Is Agentic
The application utilizes a network of cooperative, single-responsibility agents communicating through structured schemas to perform tasks that otherwise require manual engineering:
1.  **Autonomous Ingestion & Matching**: Filename parsers, subject classifiers, and sequence matchers coordinate to unzip, extract, pair exam-solution documents, and align answer keys.
2.  **Adaptive Local Extraction**: The extraction agent decides on the fly whether to read text from selectable PDF streams or call the OCR agent to process scanned page preview images.
3.  **HIL Validation Gates**: Incorporates human-in-the-loop validation, locking extracted questions and answer keys under a "needs review" status until approved by teachers.
4.  **Pedagogical Coaching**: The diagnostic checker acts as a coaching agent, standardizing inputs, identifying precision mistakes, and disabling automatic grading for drawing tasks to request manual teacher review.

---

## 4. Tools & APIs Used
*   **Core**: FastAPI, Pydantic, Python 3.10+
*   **Text & Preview Processing**: PyMuPDF (fitz) for PDF preview rendering, PyPDF2 as a stream parser fallback.
*   **Local OCR**: pytesseract + Pillow (PIL) wrapping local Tesseract-OCR binaries.
*   **Frontend**: Next.js 15, React, TailwindCSS, TypeScript.

---

## 5. What Was Built During the Course
*   **Ingestion Pipeline**: Ingestion system for local directories, PDF uploads, and ZIP package extractions with path traversal protections.
*   **Page Preview & OCR Engine**: Renders PDF pages as PNG images and executes local-first OCR text extractions.
*   **Curation Interface**: Designed the admin review dashboard with side-by-side page preview and OCR draft text comparisons.
*   **Interactive Student Coach**: Re-engineered the diagnostic form into a step-by-step coaching wizard with immediate math grading and illustrative Singapore CPA lesson cards.

---

## 6. Verification and Readiness
*   **Test Coverage**: Evaluated using **86 pytest backend integration cases** (100% passing status).
*   **Readiness checks**: Verified via a custom liveness/readiness engine monitoring safety rules, topic maps, and secrets.
*   **Type Safety**: Confirmed type safety with Next.js TypeScript compilation checks (`npx tsc --noEmit` returns zero warnings or errors).

---

## 7. Limitations
*   **OCR Speed**: Running local OCR takes 5-10 seconds per page depending on local CPU power.
*   **Subject Scope**: Topic classification is currently limited to the 38 Moroccan Math 6AEP curriculum topics.
*   **No Multi-Column Structuring**: OCR text is read top-to-bottom, which can occasionally merge text across multi-column tables.
