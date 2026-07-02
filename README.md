# ExamReady Zen — Local-First Agentic Math Exam Coach for 6AEP Students

ExamReady Zen is a local-first, privacy-respecting agentic exam coach designed to help Moroccan 6AEP (6th grade primary) students prepare for their regional standardized math examinations. The system automates the ingestion of raw, noisy historical exam sheets (PDFs and ZIP archives), handles scanned image documents using local OCR fallback, extracts and classifies questions to curriculum topics, matches expected answers from correction sheets, and guides students with immediate grading, precision warnings, and illustrated CVA lessons.

---

## 1. Problem Statement
Moroccan 6th-grade students (6AEP) face high-stakes regional standardized exams. However:
1. **Access to Quality Practice**: Historical exam papers exist primarily as scanned, noisy PDFs or archive ZIP packages distributed across informal channels.
2. **Lack of Immediate Feedback**: Standard practice sheets do not provide explanations, leading to persistent misunderstandings of mathematical concepts.
3. **Privacy and Connectivity Limits**: High reliance on heavy cloud AI services excludes students without stable internet access or introduces privacy/data safety concerns.

---

## 2. The Solution: ExamReady Zen
ExamReady Zen provides a local-first, offline-ready agentic curation and coaching pipeline:
*   **For Admins/Teachers**: An intelligent ingestion dashboard that imports historical PDF/ZIP packages, performs local OCR, extracts questions, classifies them into curriculum topics, and matches them with correction sheets—requiring only one click and a final human-in-the-loop validation.
*   **For Students**: A premium, step-by-step diagnostic coach that evaluates mathematical inputs, alerts them of formatting precision issues (such as trailing decimals `35.1` vs `35.10`), supercharges geometry drawing reviews using photo uploads, and provides illustrated Singapore CPA method lessons.

---

## 3. Agentic Architecture
ExamReady Zen utilizes a decoupled network of specialized local agents cooperating on the exam bank and diagnostic workflows:

1.  **ZIP Package Agent**: Performs safe extraction, inventories folder files, checks text density, and pairs exam sheets with their matching correction PDFs.
2.  **Math Filter Agent**: Filters out non-math content. It analyzes filename keywords and folder names to classify subjects and prioritizes math documents.
3.  **PDF Preview Agent**: Converts PDF document pages into web-friendly PNG images stored under `data/previews/{exam_id}/page_00x.png`.
4.  **OCR Agent**: Manages local Tesseract-OCR engines, converting scanned images into draft text blocks while preserving original layout references.
5.  **Question Extraction Agent**: Iterates over PDF pages or OCR drafts to identify question starters and segment them into distinct question blocks.
6.  **Topic Classification Agent**: Inspects text blocks and tags them with one of the 38 Math 6AEP curriculum topics using keyword hierarchies.
7.  **Solution Matching Agent**: Parses correction PDFs and aligns extracted solutions to questions using number markers and sequence fallbacks.
8.  **Quality Review Agent**: Calculates aggregate quality metadata (text density, layout warning flags, average question length) and assigns an overall confidence rating.
9.  **Student Diagnostic Agent**: Tracks student sessions, locks checked inputs, and structures performance metrics (strengths, weak areas) upon completion.
10. **Practice Coach Agent (Immediate Grader)**: Standardizes mathematical inputs, handles tolerance checks ($< 1e-9$), flags geometry drawings for teacher review, and prompts precision warnings.

```mermaid
graph TD
    A[Historical PDFs / ZIP] --> B(ZIP Package Agent)
    B --> C{Text density Check}
    C -- Scanned -- > D(OCR Agent)
    C -- Selectable --> E(Question Extraction Agent)
    D --> E
    E --> F(Topic Classification Agent)
    F --> G(Solution Matching Agent)
    G --> H[Human Curation Workspace]
    H -- Approval -- > I[Approved Ready Exam Bank]
    I --> J(Student Diagnostic Agent)
    J --> K(Practice Coach Agent)
    K --> L[Illustrated Lessons]
```

---

## 4. Safety and Guardrails
*   **Local-First / No Cloud Ingestion**: The system runs entirely locally. It does not connect to Google Cloud, OpenAI, or other external APIs, protecting data and operating in zero-internet environments.
*   **Strict Human-in-the-Loop Curation**: Automated question extraction and OCR drafts default to `status = "needs_review"` and `needs_manual_verification = true`. No questions are exposed to students until approved by an admin.
*   **Answer Key Protection**: Student diagnostic checks are run using only approved answer keys. Expected answers are never exposed to the client browser before checking.
*   **Local PII & Prompt Shields**: Protects local logs by checking for phone numbers, emails, and prompt injection attempts before diagnosing answers.

---

## 5. Key Features Built
*   **ZIP Exam Package Intelligence**: Performs safe extraction, inventories folder files, checks text density, and pairs exam sheets with their matching correction PDFs.
*   **PDF Page Previews & OCR Extraction**: Renders PDF pages to PNG thumbnails and runs local Tesseract OCR on scanned documents.
*   **Admin review and Curation dashboard**: Supports side-by-side modal curation with OCR draft comparison.
*   **Student Practice wizard**: Slide-by-slide diagnostic layout with immediate checking feedback and illustrated Singapore CPA lesson cards.

---

## 6. Tech Stack
*   **Backend**: Python 3.10+, FastAPI, Pydantic, PyMuPDF (fitz), PyPDF2, pytesseract, Pillow (PIL), pytest
*   **Frontend**: Next.js 15, React, TailwindCSS, TypeScript

---

## 7. Local Setup Instructions

### Prerequisites
*   Python 3.10+
*   Node.js 18+
*   Tesseract-OCR (optional, for local scanned PDF OCR support)

### How to run backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the development server (port 8030):
   ```bash
   python -m uvicorn app.health_api:app --host 127.0.0.1 --port 8030 --reload
   ```

### How to run frontend
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js dev server (port 3000):
   ```bash
   npm run dev
   ```

---

## 8. Demo URLs
*   **Teacher Exam Bank Dashboard**: `http://localhost:3000/examready-zen/exam-bank`
*   **Student Diagnostic Entry**: `http://localhost:3000/examready-zen/math-diagnostic`
*   **Local Backend API gateway**: `http://127.0.0.1:8030`
*   **Backend Readiness Check Endpoint**: `http://127.0.0.1:8030/readyz`

---

## 9. Verification & Test Results
*   **Backend Pytest Suite**: 86 backend tests passed (`python -m pytest tests/` completed successfully).
*   **Readiness Gateway**: Readiness checks passed successfully (checks for topic map availability, safety checks, and secrets scanning).
*   **Type Safety**: Frontend TypeScript compilation succeeded with zero warnings or errors (`npx tsc --noEmit` check passed).

---

## 10. Limitations & Future Work
*   **Local OCR Speed**: Processing high-resolution images via local Tesseract is single-threaded and may take 5–10 seconds per page. Future iterations will support asynchronous worker queues.
*   **Multi-Subject Extensions**: The current classification rules are hardcoded for the 38 Math 6AEP curriculum topics. Future work will expand keyword maps to French, Arabic, Islamic Education, and Science.

---

## 11. Kaggle Capstone Note
This repository serves as the official public codebase link for the **Kaggle 5-Day AI Agents: Intensive Vibe Coding Capstone Project** submission. The project is packaged as a local-first Math-only MVP using demo-safe data.
