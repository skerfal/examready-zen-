# ExamReady Zen — Step 16: Immediate Answer Checking Feature Report

This document details the implementation of Step 16: Immediate Per-Question Grading Using Approved Answer Keys for the student math diagnostic session.

---

## 1. Backend Endpoint: `POST /diagnostic/check-answer`

The new check-answer API has been registered in `app/health_api.py`. It enables the client to check the student's answer immediately on each question during an active diagnostic session.

### Request Format
```json
{
  "session_id": "string",
  "question_id": "string",
  "student_answer": "string"
}
```

### Response Format
```json
{
  "question_id": "string",
  "status": "correct" | "incorrect" | "partial" | "manual_check_required",
  "friendly_message": "string",
  "expected_answer_available": true | false,
  "correct_answer_display": "string | null",
  "mistake_type": "string | null",
  "needs_visual_review": true | false,
  "can_retry": true | false
}
```

---

## 2. Answer Checking Rules & Normalization Heuristics

The core grading and comparison logic resides in `app/answer_checker.py`.

### 1. Safety and Data Sanitization
* The session ID is verified to exist in the active `SESSIONS` memory store.
* The requested question is verified to belong to the active session.
* Internal unapproved proposed expected answers are **never leaked** to students. If the expected answer is not approved (i.e. `answer_status != "approved"`), it is treated as missing (`""`).

### 2. Geometry, Drawing & Photo-Required Questions
* Drawing/photo questions (`requires_visual_support = true` or `requires_image_upload = true` or `answer_type in ["photo", "geometry", "drawing"]`) are never automatically graded.
* They return:
  * `status`: `"manual_check_required"`
  * `needs_visual_review`: `true`
  * `friendly_message`: A child-friendly notice explaining that a teacher will manually review their drawing.

### 3. Numeric Comparison & Comma Normalization
* String answers are stripped and French decimal commas are replaced with dots (e.g. `35,1` -> `35.1`).
* Values are parsed and compared mathematically (tolerance $< 1e-9$).

### 4. Decimal Precision Warnings (Special Case)
* If the student's answer is mathematically equivalent to the expected answer but differs in decimal precision (e.g. student inputs `35.1` when `35.10` is expected):
  * `status`: `"partial"`
  * `mistake_type`: `"correct_value_precision_warning"`
  * `friendly_message`: A child-friendly warning reminding the student of writing precision (e.g., keeping two digits after the decimal point).
  * `can_retry`: `true`

---

## 3. Frontend UX & Student Flow

The student workflow in `app/examready-zen/math-diagnostic/page.tsx` has been redesigned from a simple automatic transition model to an interactive, step-by-step review flow.

```
[Question Screen]
       │
       ▼ (Input Answer)
[Vérifier ma réponse] ──(API Call)──► [Feedback Panel]
                                             │
                       ┌─────────────────────┼─────────────────────┐
                       ▼                     ▼                     ▼
                 ["Réessayer"]     ["Je veux revoir la leçon"]  ["J'ai compris, suivant"]
```

### Color Codes
* **Green (Correct)**: `emerald-50` border and text. Indicates success.
* **Amber (Partial)**: `amber-50` border and text. Prompts precision check.
* **Red (Incorrect)**: `rose-50` border and text. Shows wrong answer and prompts review.
* **Blue (Manual Review)**: `sky-50` border and text. Informs the student that the teacher will check it.

---

## 4. Manual Test Instructions

To manually test the new immediate check behavior:

1. **Start the API Server**:
   Ensure the backend FastAPI application is running locally:
   ```bash
   python -m uvicorn app.health_api:app --host 127.0.0.1 --port 8030 --reload
   ```

2. **Start the Next.js Frontend**:
   Ensure the frontend development server is running:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000/examready-zen/math-diagnostic` in your browser.

3. **Verify Golden Cases**:
   * Enter "élève_test" and select "Questions Démo".
   * For the subtraction question (`Q-MATH-01`), enter `35.10`. Click **"Vérifier ma réponse"**. You should see the green **"Réponse Correcte !"** banner. Click **"J'ai compris, question suivante"**.
   * Go back (or restart) and enter `35.1` for the same question. Click **"Vérifier ma réponse"**. You should see the amber **"Réponse Partielle"** banner with a precision warning. Click **"Réessayer"**, fix it to `35.10` and submit again.
   * Enter a wrong answer like `30`. Click **"Vérifier ma réponse"**. You should see the red **"Réponse Incorrecte"** banner. Click **"Je veux revoir la leçon"** to toggle the coach explanation.
   * Move through the questions and complete the diagnostic. Verify the final result summary dashboard continues to work.

---

## 5. Next Steps: Mastery Scoring Integration

In the next step, we will enhance the grading schema by integrating **mastery scoring** based on attempt counts and lesson usage:
* **First-try Correct**: $100\%$ score.
* **Correct after Retry**: $75\%$ score.
* **Correct after opening Lesson Card**: $50\%$ score.
* **Incorrect/Unattempted**: $0\%$ score.
