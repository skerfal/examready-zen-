# Capstone Screenshot Checklist — ExamReady Zen

Capture these screenshots to document and verify the system's capabilities for your final Kaggle submission.

---

## 1. Backend Verification Checklist

- [ ] **Pytest Terminal Output**: Run `python -m pytest tests/` in your terminal and take a screenshot showing all **86 tests passing**.
- [ ] **Readiness Gateway Output**: Run `python -c "from app.readiness_checks import run_all_readiness_checks; import json; print(json.dumps(run_all_readiness_checks(), indent=2))"` and screenshot the passing JSON configuration.
- [ ] **TypeScript Compilation Check**: Run `npx tsc --noEmit` in the `frontendiqraanow` terminal showing a clean exit with zero errors.

---

## 2. Ingestion & Curation Dashboard Screenshots

- [ ] **Exam Bank Dashboard Overview**: Go to `http://localhost:3000/examready-zen/exam-bank`. Capture the top metrics summary cards, local folder ingestion form, and the main exams table.
- [ ] **ZIP Pre-Ingestion Analysis Panel**: Paste a local ZIP package path in the "Analyser un ZIP local" field, click "Analyser", and capture the expanded package pairings and inventory tables.
- [ ] **Exam Detail Curation Page**: Go to `http://localhost:3000/examready-zen/exam-bank/{exam_id}` (e.g. `ifrane_2023_math`). Screenshot the "Informations d'ingestion" card and the "Qualité d'extraction" confidence panel.
- [ ] **Reconnaissance OCR Card**: On the exam detail curation page, capture the "Reconnaissance OCR" card showing local OCR engine status and processed page numbers.
- [ ] **Correction & Answer Matching Card**: On the curation page, capture the "Correction & Réponses Attendues" card displaying the proposed answers, matching reasons, and status badges.
- [ ] **Side-by-Side Review Workspace Modal**: Click "Voir la page originale" or "Modifier" on a question. Screenshot the open modal workspace showing the PDF page preview image on the left, the raw OCR draft text box underneath it, the warning statement, and the question edit form on the right.

---

## 3. Student Practice & Coaching Flow Screenshots

- [ ] **Student Diagnostic Entry**: Go to `http://localhost:3000/examready-zen/math-diagnostic` showing the student alias selection screen.
- [ ] **Step-by-Step Coaching Wizard**: Start the diagnostic. Take a screenshot showing a subtraction question block with the progress bar.
- [ ] **Immediate Checked Feedback Panel**: Input a wrong answer, click "Vérifier ma réponse", and capture the feedback banner displaying mistake types, expected values, and coaching remarks.
- [ ] **Precision Warning Indicator**: Input a correct value with missing precision (e.g. `35.1` instead of expected `35.10`) and capture the custom warning feedback.
- [ ] **Illustrated Illustrated Lesson Card**: Click "Voir la leçon" during a question. Screenshot the Illustrated Lesson Card displaying Singapore CPA method tabs, Vector illustrations, Wrong vs Correct mistake comparisons, and interactive practice challenges.
- [ ] **Final Student Evaluation Bilan**: Submit the diagnostic. Capture the final student evaluation dashboard showing:
    *   Dynamic level diagnosis (e.g. "Acquis", "En cours d'acquisition").
    *   Strength and weakness lists.
    *   Curriculum-aligned Practice Plan checklist block.
