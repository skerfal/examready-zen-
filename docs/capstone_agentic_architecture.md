# Agentic Architecture — ExamReady Zen

ExamReady Zen is built on a decoupled cooperative agent network. Each agent has a distinct, single responsibility, consuming and producing standardized data payloads, which limits error propagation and ensures local execution predictability.

---

## 1. Cooperative Agent Pipeline Flowchart

The following flowchart illustrates how the agents coordinate to process uploaded exam materials and guide the student.

```mermaid
graph TD
    %% Admin Ingestion Pipeline
    Sub1[ZIP/PDF Upload] --> A(ZIP Package Agent)
    A --> B(Math Filter Agent)
    B --> C{Text density Check}
    
    C -- Scanned PDF -- > D(OCR Agent)
    C -- Selectable PDF -- > E(PDF Preview Agent)
    D --> E
    
    E --> F(Question Extraction Agent)
    F --> G(Topic Classification Agent)
    G --> H(Solution Matching Agent)
    H --> I(Quality Review Agent)
    
    %% Human-in-the-loop Gate
    I --> J[Teacher Curation Workspace]
    J -- Approves Question & Answer Keys -- > K[Approved Ready Exam Bank]
    
    %% Student Diagnostic Pipeline
    K --> L(Student Diagnostic Agent)
    L --> M(Practice Coach Agent)
    M --> N[Illustrated CVA Lessons]
```

---

## 2. Agent Roles and Specifications

### 📁 Ingestion & Preparation Agents

#### 1. ZIP Package Agent (`app/zip_exam_package.py`)
*   **Role**: Safely unzips exam packages, sanitizes paths (protects against Zip Slip traversal), inventories files, and pairs exam PDFs with matching solution PDFs.
*   **Decisions**: Evaluates filenames and structures to identify whether a PDF is an exam sheet or correction key.

#### 2. Math Filter Agent (`app/exam_importer.py` & `app/zip_exam_package.py`)
*   **Role**: Filters out non-math content. It analyzes filename keywords and folder names to classify subjects (e.g. `math`, `french`, `arabic`, `islamic_education`, `science`) and filters the ingestion pipeline to prioritize math documents.

#### 3. PDF Preview Agent (`app/pdf_preview.py`)
*   **Role**: Converts PDF document pages into web-friendly PNG images stored under `data/previews/{exam_id}/page_00x.png`.
*   **Decisions**: Verifies page boundary selections and validates path parameters to prevent directory traversal.

#### 4. OCR Agent (`app/ocr_extractor.py`)
*   **Role**: Executes local Tesseract OCR on page preview images when selectable text is missing or insufficient.
*   **Decisions**: Chooses fallback language modes (`fra+ara` -> `fra` -> generic) and saves draft text artifacts to `data/ocr/{exam_id}/page_00x.txt`.

---

### 📝 Extraction & Matching Agents

#### 5. Question Extraction Agent (`app/question_extractor.py`)
*   **Role**: Parses PDF selectable text or fallback OCR pages to segment the document into individual question blocks using regex patterns.
*   **Decisions**: Decides whether to source text from selectable PDF streams or OCR drafts based on text density.

#### 6. Topic Classification Agent (`app/topic_classifier.py`)
*   **Role**: Inspects question text blocks and classifies them into one of the 38 math curriculum topics.
*   **Decisions**: Uses scoring keyword hierarchies and context overrides (e.g. distinguishing French mathematical terms).

#### 7. Solution Matching Agent (`app/answer_matcher.py` & `app/solution_extractor.py`)
*   **Role**: Parses correction PDF sheets, segments them into solution blocks, and matches them to extracted questions.
*   **Decisions**: Evaluates question/solution order sequences and number tokens to propose answer key alignments.

#### 8. Quality Review Agent (`app/question_extractor.py` & `app/health_api.py`)
*   **Role**: Calculates aggregate quality metadata (text density, layout warning flags, average question length) and assigns an overall confidence rating.
*   **Decisions**: Flags low-confidence, short-text, or OCR-derived questions as requiring manual review.

---

### 🎓 Student Diagnostic Agents

#### 9. Student Diagnostic Agent (`app/session.py` & `app/scoring.py`)
*   **Role**: Orchestrates student diagnostic sessions, processes inputs page-by-page, and tabulates final scores, strengths, and weaknesses.
*   **Decisions**: Excludes unapproved questions/exams from the diagnostic pool and compiles target practice blocks.

#### 10. Practice Coach Agent (`app/answer_checker.py`)
*   **Role**: Performs real-time answer checks, formats numeric and string inputs, and flags mistakes.
*   **Decisions**: Replaces French decimal commas, executes floating-point proximity checks ($< 1e-9$), detects trailing precision errors, and blocks automatic grading of drawing/geometry questions to trigger manual reviews.

---

## 3. Human-in-the-Loop Validation Gates

To guarantee quality and safety before students see any questions, human validation is required at two critical checkpoints:

1.  **Curation and Approval of Questions**: All questions extracted automatically from selectable text or OCR drafts are marked as `needs_review` and `needs_manual_verification = true`. Teachers must review and approve their text, difficulty, and curriculum mappings.
2.  **Curation and Approval of Answer Keys**: Solutions matched by the solution agent are flagged as `proposed`. Teachers must verify the expected answers and approve them (`answer_status = "approved"`) to unlock immediate automatic grading. Geometry drawings are locked to manual checking, requiring teachers to review student-uploaded photos.
