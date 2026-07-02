# ExamReady Zen — Step 14: Question Extraction and Topic Classification Report

This report summarizes the design, endpoints, classification engine, validation rule gates, UI design, and testing instructions for the Question Extraction and Topic Curation Workflow.

---

## 1. Extraction Workflow

1.  **Trigger**: The administrator clicks `"Extraire les questions"` on the exam curation page.
2.  **Safe Text Extraction**: The backend (`app/question_extractor.py`) reads the exam PDF page-by-page. It uses PyMuPDF (`fitz`) first, with a fallback to `PyPDF2`.
3.  **Boundary Splitting**: The extractor searches for question pattern dividers (e.g. `Question 1:`, `Q2-`, `Ex 3`, `4)`) using regex, mapping each block's location (`source_page`) and ordering (`detected_number`).
4.  **Density Gates**: If the total character count extracted is `< 100` characters, the document is flagged as `"scanned_needs_ocr"`, and the process returns no questions to avoid inventing fake text.
5.  **Topic Classification**: Each question block is evaluated by the deterministic classifier (`app/topic_classifier.py`).
6.  **Curriculum Map Alignment**: If a topic is mapped, the system matches its domain, visual support requirement, and photo drawing flags from `math_topic_map_6aep.json`.
7.  **Draft Status**: All extracted questions are created with `status = "draft"` and `needs_manual_verification = True` in the local exam JSON file under `data/historical_exams/imported/`.

---

## 2. Topic Classification Method

*   **Deterministic Classifier (`app/topic_classifier.py`)**:
    *   **Normalization**: Strips diacritics/accents, converts to lowercase, and normalizes whitespaces.
    *   **Keyword Matches**: Checks for a series of regexes and key strings mapped to the 38 key Math 6AEP topics.
    *   **Safety Guards**: Standardizes unit matching (e.g., matching length `km` or capacity `l`) so they require a number prefix (e.g. `\d+\s*km`) to prevent common French words like `"a"` (from diacritic `"à"`), `"la"`, `"le"`, or `"q"` from matching units.
    *   **Uncertainty Fallback**: If no keywords match, it maps the question to `"needs_manual_classification"` with a low-confidence score, requiring human classification before the exam can be published.

---

## 3. Curation Safety Rules

*   **Publishing Verification Gate**: An exam status cannot be promoted to `"ready"` unless:
    1.  The exam has at least one question marked as `"approved"`.
    2.  No approved question has `topic_id = "needs_manual_classification"`.
    3.  All approved questions reference a valid topic ID present in the 38-topic curriculum map.
*   **Student Exclusions**: Only questions marked as `status = "approved"` from status `"ready"` exams are selected during student diagnostic sessions or practice recommendation lists. Draft, needs_review, or rejected questions are strictly hidden from students.

---

## 4. Backend API Endpoints

*   **`POST /exam-bank/{exam_id}/extract-questions`**:
    *   Finds the PDF on disk, extracts text page-by-page, runs classification, updates the exam JSON, and returns extraction metrics.
*   **`GET /exam-bank/{exam_id}/questions`**:
    *   Lists all questions for the exam. Curated questions (like Ifrane 2023) are dynamically standardized to have an approved status for backwards compatibility.
*   **`PATCH /exam-bank/{exam_id}/questions/{question_id}`**:
    *   Patches question fields (`question_text`, `topic_id`, `answer_type`, `difficulty`, `expected_answer`, `status`, etc.) and writes changes back to disk.

---

## 5. Frontend UI Review Workspace

*   **Extraction Panel**: Displays triggers to extract questions and refresh list. Shows safety warning text: *"Les questions extraites doivent être vérifiées avant utilisation par les élèves."*
*   **Interactive Review Cards**: Renders each parsed question block showing its text, page number, confidence score, and status badge. Offers quick actions to `Modifier ⚙️`, `Approuver ✅`, and `Rejeter ❌`.
*   **Question Editing Dialog**: Opens an overlay form to modify question text, topic select dropdown (loaded dynamically from `/topics`), answer type, difficulty, expected answer (answer key), and support checkboxes.

---

## 6. Test Instructions

### Automated Tests
Run the pytest suite to verify all extraction, classification, and status patch rules:
```powershell
python -m pytest tests/
```
Verify overall compliance:
```powershell
make readiness
```

### Manual Curation Test
1.  Launch the backend (`make serve` on port 8030) and frontend (`npm run dev` on port 3000).
2.  Navigate to `http://localhost:3000/examready-zen/exam-bank`.
3.  Upload a regional exam PDF (e.g. `math_casa_2026.pdf`).
4.  Click `"Réviser ⚙️"` to open the workspace page.
5.  Click `"Extraire les questions"` under "Extraction & Analyse Automatique".
6.  Look at the list of draft questions. Click `"Modifier ⚙️"` to edit their properties, or toggle them to `"approved"` or `"rejected"`.
7.  Verify that trying to set the exam status to `"ready"` fails if any approved question is unclassified.

---

## 7. Next Step Recommendation

*   **Solution Matching and Answer-Key Review**: Integrate automatic solution text extraction matching (pairing question page nodes with correction sheet PDFs/keys) and allow teachers to review expected calculation steps interactively.
