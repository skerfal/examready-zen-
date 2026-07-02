# ExamReady Zen — Step 15: Solution / Answer-Key Matching Workflow Report

This report summarizes the design, endpoints, matching logic, auto-grading safety boundaries, UI changes, and testing instructions for the Solution / Answer-Key Matching Workflow.

---

## 1. Solution Extraction and Splitting

1.  **Trigger**: The administrator provides a local correction PDF absolute path on the exam curation page and clicks `"Extraire les corrections"`.
2.  **Safe Text Extraction**: The backend (`app/solution_extractor.py`) reads the solution PDF page-by-page. It uses PyMuPDF (`fitz`) first, with a fallback to `PyPDF2` to read raw page text.
3.  **Density Gates**: If the total character count extracted is `< 100` characters, the document is flagged as `"scanned_solution_needs_ocr"`, and the process halts to avoid making up answers.
4.  **Answer Block Splitting**: The extractor searches for answer pattern dividers (e.g. `Question 1:`, `Q2-`, `Correction 3`, `Ex 4`, `Réponse 5`) using regex, mapping each block's location (`source_page`) and proposed number (`proposed_number`).

---

## 2. Answer Key Matching Algorithm

*   **Answer Matcher (`app/answer_matcher.py`)**:
    *   **Question Number Match**: Matches an extracted answer block to an existing question if its proposed number matches the question's detected number or number parsed from its question ID (e.g. block `Q2` matches question `exam_Q02`).
    *   **Sequence Index Match**: If the number of questions and solution blocks matches exactly, it aligns them sequentially as a fallback.
    *   **Keyword/Text Overlap Match**: Checks for word overlap (filtering out short words) between the question text and answer block text. An overlap of 2 or more words generates a low-confidence proposal.
    *   **Protection Gate**: Already approved `expected_answer` values are protected and never overwritten automatically by new extraction proposals.
    *   **Fallback**: If no match is found, the question's answer status is set to `"needs_manual_answer_review"`.

---

## 3. Answer Curation Status Workflow

The question structure in the exam JSON is updated to store:
*   `expected_answer`: The final approved answer used for grading.
*   `proposed_expected_answer`: The raw answer proposed by the extractor.
*   `answer_source_file`: The filename of the solution PDF.
*   `answer_matching_confidence`: `high` | `medium` | `low` | `needs_manual_answer_review`
*   `answer_matching_reason`: Details on how the match was achieved.
*   `answer_status`: `missing` | `proposed` | `approved` | `rejected` | `needs_manual_answer_review`

---

## 4. Auto-Grading & Publishing Safety Boundaries

*   **Ready Check Gate**:
    *   An exam status can be promoted to `"ready"` if it has at least one approved question and all approved questions point to valid curriculum topics.
    *   For auto-checkable questions (`answer_type in ["numeric", "text", "chart_interpretation"]`), if `expected_answer` is missing or `answer_status != "approved"`, the backend returns a response warning: `"ready_with_missing_answers_warning"`.
    *   Geometry or drawing questions that require human/photo review are not subject to this warning.
    *   The exam status is still updated to `"ready"` (allowing practice), but the warning is returned to notify the admin.
*   **Auto-Grading Check**:
    *   During diagnostic session submission, scoring strictly checks if the question's answer status is `"approved"` (or if it is the curated Ifrane 2023 Math exam, which is approved by default). If not approved, the expected answer defaults to `""` for grading to prevent checking against unverified or unapproved keys.

---

## 5. Backend API Endpoints

*   **`POST /exam-bank/{exam_id}/extract-solutions`**:
    *   Ingests the solution PDF path, runs `solution_extractor.py` and `answer_matcher.py`, writes updates to the exam JSON, and returns match proposals.
*   **`GET /exam-bank/{exam_id}/answers`**:
    *   Returns all answer proposals, status, and confidence levels.
*   **`PATCH /exam-bank/{exam_id}/questions/{question_id}/answer`**:
    *   Allows the admin to approve the proposed answer, edit the expected answer manually, reject a proposal, or update the answer status.

---

## 6. Frontend UI Curation Workspace

*   **Correction / Réponses Attendues Section**:
    *   Displays a text input for the local correction PDF absolute path and a button to trigger extraction.
    *   Shows the safety warning: *“Les réponses proposées doivent être vérifiées avant d’être utilisées pour corriger les élèves.”*
*   **Proposed Answers List/Cards**:
    *   Renders each question's matching details inline, showing the proposed answer, confidence badge, matching reason, and current answer status.
    *   Provides quick controls to `Approuver la réponse ✅` and `Rejeter la réponse ❌`.
*   **Question Edit Modal**:
    *   Includes inputs to view/edit `expected_answer` manually, view the read-only `proposed_expected_answer` and confidence level, and update `answer_status` via a dropdown.

---

## 7. Testing and Verification Instructions

### Automated Tests
Run the pytest suite to verify all solution extraction, answer matching, and review rules:
```powershell
python -m pytest tests/
```
Verify overall compliance:
```powershell
make readiness
```

### Frontend TypeScript Check
Verify clean compilation with zero warnings/errors:
```powershell
npx tsc --noEmit
```

### Manual Verification
1.  Run the backend (`make serve` on port 8030) and the frontend (`npm run dev` on port 3000).
2.  Open `http://localhost:3000/examready-zen/exam-bank`.
3.  Upload or select an imported draft exam (e.g. `math_casa_2026`). Click `"Réviser ⚙️"`.
4.  Enter the local absolute path of the correction PDF in the "Correction & Réponses Attendues" card.
5.  Click `"Extraire les corrections"`.
6.  Look at the answer proposals that appear in each question card.
7.  Verify that clicking `"Approuver la réponse ✅"` updates the question's answer status to approved.
8.  Try saving the exam status as `"ready"`. Confirm warning messages are visible if answers are missing for auto-checkable questions.
