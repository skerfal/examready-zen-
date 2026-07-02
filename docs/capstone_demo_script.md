# Capstone Demo Script — ExamReady Zen

This script outlines a 2–3 minute video walkthrough of the ExamReady Zen application, showcasing the teacher curation pipeline and the student coaching experience.

---

## 🎬 Act 1: Teacher/Admin Dashboard & Pre-Ingestion (0:00 - 0:45)

*   **Visual**: Screen shows the **Exam Bank Dashboard** at `http://localhost:3000/examready-zen/exam-bank`. Scroll down to display the curated *Ifrane 2023* exam and the metrics bar (Total Exams: 37, Needs Manual Review: 36).
*   **Audio (Voiceover)**:
    > "Welcome to ExamReady Zen, a local-first agentic math coach for Moroccan 6AEP students. As a teacher or administrator, managing raw historical exams is a major challenge. Let's see how our cooperative agents automate this.
    > Here on the Exam Bank Dashboard, we have a list of ingested exams, curriculum coverage stats, and priority warnings. Let's upload a new archive package to see the agents in action."
*   **Action**: Click the upload box and select `exam_package_2026.zip` or paste a local zip path and click **Analyser**.
*   **Visual**: The **ZIP Package Analysis** panel expands immediately, listing the unzipped PDFs, identifying subjects, and showing the automatic pairing of `math_casa_2026.pdf` with `math_casa_2026_corr.pdf`.

---

## 🎬 Act 2: Curation, PDF Previews & Local OCR (0:45 - 1:45)

*   **Visual**: Navigate to the details page of the newly uploaded exam at `http://localhost:3000/examready-zen/exam-bank/math_casa_2026`.
*   **Audio (Voiceover)**:
    > "Our exam details page shows extraction quality metrics. The system flags this PDF as a suspected scan because it has low text density.
    > First, we render page previews so we can review the original layout. Next, because the text is scanned, we launch our local-first OCR agent. This reads the pages using Tesseract, running entirely offline."
*   **Action**: Click **Générer les aperçus PDF**, then click **Lancer l’OCR** in the Reconnaissance OCR card.
*   **Visual**: Page previews render as PNG thumbnails. OCR status switches to "success", displaying pages processed `[1, 2]`.
*   **Action**: Click **Extraire les questions**.
*   **Visual**: The questions list compiles questions derived from the OCR draft text.
*   **Audio (Voiceover)**:
    > "With one click, our extraction agent segments the OCR draft into structured questions, and the topic classifier maps them to curriculum skills.
    > Notice that these questions default to a draft state with low confidence flags. We require human verification. Let's check a question."
*   **Action**: Click **Voir la page originale** on Question 1.
*   **Visual**: The **Side-by-Side Review Modal** opens: Original PDF Page image on the left, raw OCR draft text box (with a warning statement) under it, and the edit form on the right. Modify the question text and click **Enregistrer**.

---

## 🎬 Act 3: Student Diagnostic & Immediate Grading (1:45 - 2:30)

*   **Visual**: Switch view to the student entry point at `http://localhost:3000/examready-zen/math-diagnostic`. Type alias `"Yasmin"` and click **Commencer**.
*   **Audio (Voiceover)**:
    > "Now, let's step into the student's shoes. Yasmin is practicing Math using the newly curated and approved Casa 2026 exam.
    > The diagnostic uses a wizard format. Yasmin inputs `15.5` for Question 1, clicks 'Vérifier', and receives immediate feedback. For Question 2, she inputs a value with minor trailing decimals. The coach detects the correct value but prompts a precision warning."
*   **Action**: Solve Question 1, input `35.1` for Question 2 to trigger the precision warning, and view the Illustrated Lesson Card by clicking **Voir la leçon**.
*   **Visual**: Show the illustratedSingapore CPA method card, mistake comparison wrong vs correct, and the guided practice challenge.
*   **Action**: Complete the diagnostic wizard and click **Bilan**.
*   **Visual**: The final student summary dashboard displays: level assessment, parent-friendly summary comments, lists of strengths and weak skills, and the custom practice plan.
*   **Audio (Voiceover)**:
    > "Upon completion, the Student Diagnostic Agent compiles Yasmin's diagnostic metrics, highlighting concepts mastered and detailing a custom Practice Plan.
    > ExamReady Zen proves that local-first, privacy-safe AI agents can turn noisy historical print documents into structured, premium coaching programs. Thank you!"
