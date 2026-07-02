"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  checkReadiness,
  startDiagnostic,
  submitDiagnostic,
  getRevisionNote,
  Question,
  SubmitSessionResponse,
  AnswerItem,
  diagnoseAnswer,
  checkDiagnosticAnswer,
  CheckAnswerResponse
} from "@/lib/examreadyZenApi";
import PremiumTopicLessonCard from "@/components/examready/PremiumTopicLessonCard";
import ReinforcementFlow from "@/components/examready/ReinforcementFlow";
import MathSymbolKeyboard from "@/components/examready/MathSymbolKeyboard";

export interface CheckedFeedback {
  status: "correct" | "incorrect" | "partial" | "needs_review" | "blocked_security_risk" | "manual_check_required";
  feedbackText: string;
  expectedAnswer?: string;
}

export function getFriendlyMessage(status: CheckedFeedback["status"]) {
  switch (status) {
    case "correct":
      return "Bravo, ta réponse est correcte. Tu peux passer à la question suivante.";
    case "incorrect":
      return "Pas encore. Regarde la méthode, puis essaie encore une fois.";
    case "partial":
      return "Tu as compris l’idée, mais il manque une précision.";
    case "needs_review":
    case "manual_check_required":
      return "Cette réponse demande une vérification manuelle par l'enseignant.";
    case "blocked_security_risk":
      return "Cette réponse contient des caractères non autorisés.";
    default:
      return "";
  }
}

const EXPECTED_ANSWERS: Record<string, string> = {
  // Ifrane 2023
  "IFR23-Q01": "25.41 > 25.4 > 25.14 > 251/10 > 25.04 > 25",
  "IFR23-Q02": "105563.6",
  "IFR23-Q03": "495889.2",
  "IFR23-Q04": "243",
  "IFR23-Q05": "5/24",
  "IFR23-Q06": "6² * 5³",
  "IFR23-Q07": "110",
  "IFR23-Q08": "triangle",
  "IFR23-Q09": "symétrique",
  "IFR23-Q10": "agrandissement",
  "IFR23-Q11": "295",
  "IFR23-Q12": "8.3",
  "IFR23-Q13": "123.5",
  "IFR23-Q14": "3250",
  "IFR23-Q15": "62.8",
  "IFR23-Q16": "3",
  "IFR23-Q17": "48",
  "IFR23-Q18": "football",

  // Demo Questions
  "Q-MATH-01": "35.10",
  "Q-MATH-02": "16.86",
  "Q-MATH-03": "45.6",
  "Q-MATH-04": "True",
  "Q-MATH-05": "3.25"
};

export default function MathDiagnosticPage() {
  // State variables
  const [studentAlias, setStudentAlias] = useState("élève_demo");
  const [source, setSource] = useState("historical_ifrane_2023");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Session states
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  // Results state
  const [results, setResults] = useState<SubmitSessionResponse | null>(null);
  
  // Backend availability state
  const [backendReady, setBackendReady] = useState<boolean | null>(null);

  // One-question-at-a-time states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [explanationOpenedByQuestionId, setExplanationOpenedByQuestionId] = useState<Record<string, boolean>>({});
  const [activeRevisionNote, setActiveRevisionNote] = useState<any | null>(null);
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [noteLoading, setNoteLoading] = useState(false);

  // Answer checking & feedback states
  const [checkedFeedbackByQuestionId, setCheckedFeedbackByQuestionId] = useState<Record<string, CheckedFeedback>>({});
  const [attemptsByQuestionId, setAttemptsByQuestionId] = useState<Record<string, number>>({});
  const [isCheckingAnswer, setIsCheckingAnswer] = useState(false);
  const [lessonTab, setLessonTab] = useState<"concrete" | "visual" | "abstract">("concrete");

  // Check if backend is running on mount
  useEffect(() => {
    async function verifyBackend() {
      try {
        const readyData = await checkReadiness();
        if (readyData.overall_status === "ready") {
          setBackendReady(true);
        } else {
          setBackendReady(false);
          setErrorMsg("Le serveur est en ligne mais son statut de préparation n'est pas prêt.");
        }
      } catch (err) {
        setBackendReady(false);
        setErrorMsg("Backend local non disponible. Lancez examready-zen-api sur le port 8030.");
      }
    }
    verifyBackend();
  }, []);

  // Handle start diagnostic
  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setResults(null);
    setCurrentQuestionIndex(0);
    setExplanationOpenedByQuestionId({});
    setActiveRevisionNote(null);
    setIsExplanationOpen(false);
    setCheckedFeedbackByQuestionId({});
    setAttemptsByQuestionId({});
    setIsCheckingAnswer(false);
    try {
      const data = await startDiagnostic(studentAlias, source);
      setSessionId(data.session_id);
      setQuestions(data.questions);
      // Initialize empty answers
      const initialAnswers: Record<string, string> = {};
      data.questions.forEach((q) => {
        initialAnswers[q.question_id] = "";
      });
      setAnswers(initialAnswers);
      setIsSessionActive(true);
    } catch (err: any) {
      setErrorMsg("Impossible de démarrer la session. Vérifiez la connexion avec le serveur.");
    } finally {
      setLoading(false);
    }
  };

  // Handle text answer change
  const handleAnswerChange = (questionId: string, val: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: val,
    }));
  };

  // Handle answers submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!sessionId) return;
    
    setLoading(true);
    setErrorMsg(null);
    try {
      const answersList: AnswerItem[] = Object.keys(answers).map((qId) => ({
        question_id: qId,
        student_answer: answers[qId],
      }));
      const res = await submitDiagnostic(sessionId, answersList);
      setResults(res);
      setIsSessionActive(false);
    } catch (err: any) {
      setErrorMsg("Erreur lors de la soumission de vos réponses. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  // Handle restart diagnostic
  const handleReset = () => {
    setSessionId(null);
    setQuestions([]);
    setAnswers({});
    setResults(null);
    setIsSessionActive(false);
    setErrorMsg(null);
    setCurrentQuestionIndex(0);
    setExplanationOpenedByQuestionId({});
    setActiveRevisionNote(null);
    setIsExplanationOpen(false);
    setCheckedFeedbackByQuestionId({});
    setAttemptsByQuestionId({});
    setIsCheckingAnswer(false);
  };

  // One-question-at-a-time handlers
  const handleNext = () => {
    const q = questions[currentQuestionIndex];
    const ans = answers[q.question_id] || "";
    if (ans.trim() === "") {
      alert("Réponds à cette question avant de passer à la suivante, ou clique sur Ignorer si tu veux continuer.");
      return;
    }
    setCurrentQuestionIndex((prev) => prev + 1);
    handleCloseExplanation();
  };

  const handleOpenLesson = async () => {
    if (!currentQuestion) return;
    const isGeometryOrPhoto = 
      currentQuestion.requires_image_upload || 
      currentQuestion.requires_visual_support || 
      currentQuestion.answer_type === "drawing" || 
      currentQuestion.answer_type === "photo" || 
      currentQuestion.answer_type === "geometry";
    
    await handleOpenExplanation(
      currentQuestion.topic_id, 
      currentQuestion.question_id, 
      isGeometryOrPhoto ? "visual" : "abstract"
    );
  };

  const handleSkip = () => {
    if (!currentQuestion) return;
    const qId = currentQuestion.question_id;
    setAnswers((prev) => ({
      ...prev,
      [qId]: ""
    }));
    setCheckedFeedbackByQuestionId((prev) => ({
      ...prev,
      [qId]: {
        status: "needs_review",
        feedbackText: "Défi ignoré. Découvre la méthode de résolution ci-dessous pour progresser."
      }
    }));
    // Auto open explanation on skip to show the correct method
    setTimeout(() => {
      handleOpenLesson();
    }, 0);
  };

  const handlePrev = () => {
    setCurrentQuestionIndex((prev) => prev - 1);
    handleCloseExplanation();
  };

  const handleOpenExplanation = async (topicId: string, questionId: string, tab: "concrete" | "visual" | "abstract" = "concrete") => {
    setLessonTab(tab);
    setNoteLoading(true);
    setIsExplanationOpen(true);
    setExplanationOpenedByQuestionId((prev) => ({
      ...prev,
      [questionId]: true
    }));
    try {
      const note = await getRevisionNote(topicId);
      setActiveRevisionNote(note);
    } catch (err) {
      console.error("Failed to load revision note:", err);
      setActiveRevisionNote({
        topic_id: topicId,
        title_for_student: topicId.replace("_", " "),
        very_easy_explanation: "Revois cette leçon dans tes notes de cours.",
        all_rules_to_remember: "1. Relis la consigne attentivement.\n2. Pose les calculs au brouillon.",
        worked_examples: "N/A",
        common_traps: "N/A",
        mini_practice_questions: "N/A",
        answer_key: "N/A",
        remediation_hint: "",
        visual_description: "",
        when_to_upload_photo: ""
      });
    } finally {
      setNoteLoading(false);
    }
  };

  const handleCloseExplanation = () => {
    setIsExplanationOpen(false);
    setActiveRevisionNote(null);
  };

  const handleCheckAnswer = async () => {
    if (!currentQuestion || !sessionId) return;
    const qId = currentQuestion.question_id;
    const studentAns = answers[qId] || "";
    if (studentAns.trim() === "") {
      alert("S'il te plaît, écris une réponse avant de vérifier !");
      return;
    }

    setIsCheckingAnswer(true);
    setErrorMsg(null);

    try {
      const response = await checkDiagnosticAnswer(
        sessionId,
        qId,
        studentAns
      );

      setCheckedFeedbackByQuestionId((prev) => ({
        ...prev,
        [qId]: {
          status: response.status,
          feedbackText: response.friendly_message,
          expectedAnswer: response.expected_answer_available && response.correct_answer_display
            ? response.correct_answer_display
            : undefined
        }
      }));

      setAttemptsByQuestionId((prev) => ({
        ...prev,
        [qId]: (prev[qId] || 0) + 1
      }));

      // If it is geometry or needs visual review, automatically open lesson/explanation in visual tab
      if (response.needs_visual_review) {
        await handleOpenExplanation(currentQuestion.topic_id, qId, "visual");
      }
    } catch (err) {
      console.error("Failed to check answer:", err);
      setErrorMsg("Impossible de vérifier la réponse avec le serveur.");
    } finally {
      setIsCheckingAnswer(false);
    }
  };

  const handleRetry = () => {
    if (!currentQuestion) return;
    const qId = currentQuestion.question_id;
    setCheckedFeedbackByQuestionId((prev) => {
      const copy = { ...prev };
      delete copy[qId];
      return copy;
    });
    // Focus input field
    setTimeout(() => {
      const inputEl = document.getElementById(`q-${qId}`);
      if (inputEl) {
        inputEl.focus();
      }
    }, 0);
  };

  const handleConfirmAndNext = () => {
    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      handleCloseExplanation();
    }
  };

  const handleInsertSymbol = (symbol: string) => {
    if (!currentQuestion) return;
    const qId = currentQuestion.question_id;
    const currentVal = answers[qId] || "";
    setAnswers((prev) => ({
      ...prev,
      [qId]: currentVal + symbol
    }));
    // Refocus the input element
    setTimeout(() => {
      const inputEl = document.getElementById(`q-${qId}`);
      if (inputEl) {
        inputEl.focus();
      }
    }, 0);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const activeProgressPercent = questions.length > 0 ? Math.round((currentQuestionIndex / questions.length) * 100) : 0;
  const wasExplanationOpened = Object.values(explanationOpenedByQuestionId).some(Boolean);

  return (
    <main className="min-h-screen bg-paper py-10 px-4 md:px-8 max-w-4xl mx-auto font-sans text-ink">
      <header className="mb-10 text-center flex flex-col items-center gap-2">
        <h1 className="text-3xl md:text-5xl font-extrabold font-display text-accent tracking-tight">
          ExamReady Zen
        </h1>
        <p className="text-sm font-semibold tracking-wider text-ink-2 uppercase">
          Évaluation Mathématiques 6AEP
        </p>
        <div className="w-16 h-1 bg-accent rounded-full mt-2" />
        <Link
          href="/examready-zen/exam-bank"
          className="text-xs text-blue hover:text-blue/80 font-bold transition-all underline mt-2"
        >
          Gérer la banque d’examens 📋
        </Link>
      </header>

      {/* Backend down warning card */}
      {backendReady === false && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center shadow-md mb-8">
          <span className="text-4xl mb-3 block">🔌</span>
          <h3 className="text-red-700 font-bold text-lg mb-2 font-display">
            Erreur de connexion
          </h3>
          <p className="text-red-900 text-sm leading-relaxed max-w-md mx-auto">
            {errorMsg || "Backend local non disponible. Lancez examready-zen-api sur le port 8030."}
          </p>
        </div>
      )}

      {/* Main Container */}
      {backendReady !== false && (
        <div className="bg-white rounded-3xl border border-paper-3 p-6 md:p-8 shadow-sm">
          {errorMsg && (
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 text-accent text-sm font-semibold mb-6 flex items-center gap-2">
              <span>⚠️</span> {errorMsg}
            </div>
          )}

          {/* 1. STATE: LOBBY / ENTRY GATE */}
          {!isSessionActive && !results && (
            <div className="flex flex-col gap-6">
              <div className="text-center md:text-left">
                <h2 className="text-xl md:text-2xl font-bold font-display mb-2 text-ink">
                  Commençons ton diagnostic
                </h2>
                <p className="text-sm text-ink-2 leading-relaxed">
                  Nous commençons par connaître ton niveau sur les compétences prioritaires de l'examen régional avant de te proposer un plan de révision et des exercices d'entraînement ciblés.
                </p>
              </div>

              <form onSubmit={handleStart} className="flex flex-col gap-5 max-w-md">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="studentAlias" className="text-xs font-bold text-ink uppercase tracking-wider">
                    Ton pseudo d'élève
                  </label>
                  <input
                    type="text"
                    id="studentAlias"
                    required
                    value={studentAlias}
                    onChange={(e) => setStudentAlias(e.target.value)}
                    className="w-full bg-paper-2 border border-paper-3 focus:border-accent rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
                    placeholder="Ex: Younes"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="sourceSelect" className="text-xs font-bold text-ink uppercase tracking-wider">
                    Banque de questions
                  </label>
                  <select
                    id="sourceSelect"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full bg-paper-2 border border-paper-3 focus:border-accent rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
                  >
                    <option value="historical_ifrane_2023">Examen Historique - Ifrane 2023</option>
                    <option value="demo">Questions Démo (Rapide)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-accent hover:bg-accent-dark text-white font-bold px-6 py-3 rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50 text-sm tracking-wide"
                >
                  {loading ? "Chargement des questions..." : "Commencer le diagnostic 🚀"}
                </button>
              </form>
            </div>
          )}

          {/* 2. STATE: ACTIVE DIAGNOSTIC TEST */}
          {isSessionActive && currentQuestion && (
            <div className="flex flex-col gap-8">
              {/* Progress Header */}
              <div className="border-b border-paper-3 pb-4">
                <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                  <h2 className="text-lg md:text-xl font-bold font-display text-ink">
                    Évaluation en cours
                  </h2>
                  <span className="text-xs font-extrabold text-blue font-mono bg-blue/10 px-2.5 py-1 rounded-full border border-blue/20">
                    Question {currentQuestionIndex + 1} / {questions.length}
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full bg-paper-3 h-2.5 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="bg-accent h-full transition-all duration-300"
                    style={{ width: `${activeProgressPercent}%` }}
                  />
                </div>
              </div>

              {/* Single Question Container */}
              <div className="bg-paper rounded-3xl border border-paper-3 p-6 flex flex-col gap-5 shadow-sm relative">
                {/* Header tags */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                  <span className="bg-blue/10 text-blue px-3 py-1 rounded-full border border-blue/20 uppercase tracking-wider text-[10px] font-bold">
                    {currentQuestion.domain.replace("_", " ")}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full uppercase text-[10px] font-extrabold ${
                    currentQuestion.difficulty === "easy" ? "bg-green/10 text-green" :
                    currentQuestion.difficulty === "medium" ? "bg-gold/10 text-gold" : "bg-accent/10 text-accent"
                  }`}>
                    {currentQuestion.difficulty}
                  </span>
                </div>

                {/* Question text */}
                <p className="text-base md:text-lg font-bold text-ink leading-relaxed font-display">
                  {currentQuestion.question_text}
                </p>

                {/* Image upload warning badges */}
                {currentQuestion.requires_image_upload && (
                  <div className="bg-accent/10 border border-accent/20 rounded-xl px-4 py-2.5 text-xs text-accent-dark font-semibold flex items-center gap-2 self-start shadow-sm">
                    <span>📷</span> Dessin sur papier recommandé (évaluation par photo recommandée)
                  </div>
                )}
                {currentQuestion.requires_visual_support && !currentQuestion.requires_image_upload && (
                  <div className="bg-blue/10 border border-blue/20 rounded-xl px-4 py-2.5 text-xs text-blue font-semibold flex items-center gap-2 self-start shadow-sm">
                    <span>📐</span> Support géométrique ou visuel requis
                  </div>
                )}

                {/* Answer text input */}
                <div className="flex flex-col gap-1.5 mt-2">
                  <label htmlFor={`q-${currentQuestion.question_id}`} className="text-xs font-extrabold text-ink-2 uppercase tracking-wider">
                    Ta réponse :
                  </label>
                  <input
                    type="text"
                    id={`q-${currentQuestion.question_id}`}
                    disabled={!!checkedFeedbackByQuestionId[currentQuestion.question_id]}
                    value={answers[currentQuestion.question_id] || ""}
                    onChange={(e) => handleAnswerChange(currentQuestion.question_id, e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors font-mono shadow-sm ${
                      checkedFeedbackByQuestionId[currentQuestion.question_id]
                        ? "bg-paper-2 border-paper-3 text-ink-3 cursor-not-allowed font-semibold"
                        : "bg-white border-paper-3 focus:border-accent"
                    }`}
                    placeholder={currentQuestion.answer_type === "numeric" ? "Ex: 24.5" : "Ex: football"}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (checkedFeedbackByQuestionId[currentQuestion.question_id]) {
                          handleConfirmAndNext();
                        } else {
                          handleCheckAnswer();
                        }
                      }
                    }}
                  />
                </div>

                <MathSymbolKeyboard
                  topicId={currentQuestion.topic_id}
                  answerType={currentQuestion.answer_type}
                  onInsertSymbol={handleInsertSymbol}
                />

                {/* Immediate Feedback Panel & Actions */}
                {checkedFeedbackByQuestionId[currentQuestion.question_id] ? (
                  <div className={`rounded-2xl p-5 border flex flex-col gap-3 shadow-sm ${
                    checkedFeedbackByQuestionId[currentQuestion.question_id].status === "correct" ? "bg-emerald-50/90 border-emerald-200 text-emerald-950" :
                    checkedFeedbackByQuestionId[currentQuestion.question_id].status === "partial" ? "bg-amber-50/90 border-amber-200 text-amber-950" :
                    checkedFeedbackByQuestionId[currentQuestion.question_id].status === "needs_review" || checkedFeedbackByQuestionId[currentQuestion.question_id].status === "manual_check_required" ? "bg-sky-50/90 border-sky-200 text-sky-950" :
                    "bg-rose-50/90 border-rose-200 text-rose-950"
                  }`}>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {checkedFeedbackByQuestionId[currentQuestion.question_id].status === "correct" ? "✅" :
                           checkedFeedbackByQuestionId[currentQuestion.question_id].status === "partial" ? "⚠️" :
                           checkedFeedbackByQuestionId[currentQuestion.question_id].status === "needs_review" || checkedFeedbackByQuestionId[currentQuestion.question_id].status === "manual_check_required" ? "🔍" : "❌"}
                        </span>
                        <span className="text-sm font-extrabold uppercase tracking-wide">
                          {checkedFeedbackByQuestionId[currentQuestion.question_id].status === "correct" ? "Réponse Correcte !" :
                           checkedFeedbackByQuestionId[currentQuestion.question_id].status === "partial" ? "Réponse Partielle" :
                           checkedFeedbackByQuestionId[currentQuestion.question_id].status === "needs_review" || checkedFeedbackByQuestionId[currentQuestion.question_id].status === "manual_check_required" ? "À Vérifier Visuellement" : "Réponse Incorrecte"}
                        </span>
                      </div>
                      
                      {attemptsByQuestionId[currentQuestion.question_id] > 0 && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 bg-black/5 rounded-full text-ink-2">
                          Tentative {attemptsByQuestionId[currentQuestion.question_id]}
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-bold leading-relaxed">
                      {getFriendlyMessage(checkedFeedbackByQuestionId[currentQuestion.question_id].status)}
                    </p>

                    {/* Correct answer display if incorrect/partial */}
                    {checkedFeedbackByQuestionId[currentQuestion.question_id].status !== "correct" && 
                     checkedFeedbackByQuestionId[currentQuestion.question_id].expectedAnswer && (
                      <div className="text-xs font-semibold mt-1 text-ink-2 flex items-center gap-1.5 flex-wrap">
                        <span>Réponse attendue :</span>{" "}
                        <code className="bg-black/5 px-2 py-0.5 rounded font-mono font-bold text-accent-dark">
                          {checkedFeedbackByQuestionId[currentQuestion.question_id].expectedAnswer}
                        </code>
                      </div>
                    )}

                    {/* Detailed AI feedback if any */}
                    {checkedFeedbackByQuestionId[currentQuestion.question_id].feedbackText && 
                     checkedFeedbackByQuestionId[currentQuestion.question_id].feedbackText !== getFriendlyMessage(checkedFeedbackByQuestionId[currentQuestion.question_id].status) && (
                      <div className="text-xs md:text-sm font-medium leading-relaxed bg-white/70 p-3.5 rounded-xl border border-black/5 text-ink-2">
                        <span className="font-extrabold text-ink block mb-1">🔍 Analyse détaillée :</span>
                        {checkedFeedbackByQuestionId[currentQuestion.question_id].feedbackText}
                      </div>
                    )}

                    {/* Buttons inside feedback panel */}
                    <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-black/5">
                      {checkedFeedbackByQuestionId[currentQuestion.question_id].status !== "correct" && 
                       checkedFeedbackByQuestionId[currentQuestion.question_id].status !== "needs_review" && 
                       checkedFeedbackByQuestionId[currentQuestion.question_id].status !== "manual_check_required" && (
                        <button
                          type="button"
                          onClick={handleRetry}
                          className="bg-white hover:bg-paper-2 text-ink text-xs font-bold px-4 py-2 rounded-xl transition-all border border-paper-3 shadow-sm cursor-pointer"
                        >
                          🔄 Réessayer
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          if (isExplanationOpen) {
                            handleCloseExplanation();
                          } else {
                            handleOpenLesson();
                          }
                        }}
                        className="bg-white hover:bg-paper-2 text-blue text-xs font-bold px-4 py-2 rounded-xl transition-all border border-blue/20 shadow-sm cursor-pointer"
                      >
                        📖 {isExplanationOpen ? "Masquer la leçon" : "Je veux revoir la leçon"}
                      </button>

                      <button
                        type="button"
                        onClick={handleConfirmAndNext}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4.5 py-2.5 rounded-xl transition-all shadow-md ml-auto cursor-pointer"
                      >
                        {isLastQuestion ? "J’ai compris, voir mon bilan 📊" : "J’ai compris, question suivante ➡️"}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Action Buttons before Check */
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        if (isExplanationOpen) {
                          handleCloseExplanation();
                        } else {
                          handleOpenLesson();
                        }
                      }}
                      className="text-xs font-bold text-blue hover:text-blue/80 flex items-center gap-1.5 transition-all cursor-pointer bg-blue/5 px-3.5 py-2.5 rounded-xl border border-blue/15 shadow-sm"
                    >
                      <span>📖</span> {isExplanationOpen ? "Masquer la leçon" : "Voir l'explication du sujet"}
                    </button>

                    <button
                      type="button"
                      disabled={isCheckingAnswer || (answers[currentQuestion.question_id] || "").trim() === ""}
                      onClick={handleCheckAnswer}
                      className="bg-accent hover:bg-accent-dark disabled:opacity-50 text-white text-xs md:text-sm font-bold px-5 py-2.5 rounded-xl cursor-pointer shadow-md transition-all flex items-center gap-2"
                    >
                      {isCheckingAnswer ? (
                        <>
                          <span className="animate-spin text-sm">⏳</span> Vérification...
                        </>
                      ) : (
                        <>
                          <span>🔍</span> Vérifier ma réponse
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Collapsible Panel */}
                {isExplanationOpen && (
                  <div className="border border-dashed border-paper-3 rounded-3xl p-4 bg-paper/30 animate-fade-in mt-2">
                    {noteLoading ? (
                      <div className="text-center py-6 text-sm font-semibold text-ink-2 flex items-center justify-center gap-2">
                        <span className="animate-spin text-lg">⏳</span> Chargement du coach de cours...
                      </div>
                    ) : activeRevisionNote ? (
                      <div className="flex flex-col gap-4">
                        <PremiumTopicLessonCard note={activeRevisionNote} initialTab={lessonTab} />
                        <button
                          type="button"
                          onClick={handleCloseExplanation}
                          className="bg-paper-2 hover:bg-paper-3 text-ink-2 text-xs font-bold px-4 py-2 rounded-xl self-end border border-paper-3 transition-colors cursor-pointer"
                        >
                          Masquer l'explication ✖️
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Navigation Action Buttons bar */}
              <div className="flex justify-between items-center gap-4 flex-wrap border-t border-paper-3 pt-6">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="bg-paper-2 hover:bg-paper-3 text-ink-2 text-xs md:text-sm font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-colors border border-paper-3"
                  >
                    Annuler le test
                  </button>
                  
                  {currentQuestionIndex > 0 && (
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="bg-white hover:bg-paper-2 text-ink text-xs md:text-sm font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-colors border border-paper-3"
                    >
                      ⬅️ Retour
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  {!checkedFeedbackByQuestionId[currentQuestion.question_id] && (
                    <button
                      type="button"
                      onClick={handleSkip}
                      className="bg-paper-2 hover:bg-paper-3 text-ink-2 text-xs md:text-sm font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
                    >
                      Ignorer ce défi
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. STATE: RESULTS DISPLAY */}
          {results && (
            <div className="flex flex-col gap-8">
              {/* Score Header */}
              <div className="text-center bg-paper-2 rounded-2xl p-6 border border-paper-3 flex flex-col items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-widest text-accent bg-accent/15 px-3 py-1 rounded-full">
                  Résultats du Diagnostic
                </span>
                
                {/* Visual indicator badges */}
                <div className="flex flex-wrap gap-2 justify-center mt-1">
                  {results.visual_support_needed && (
                    <span className="text-[10px] md:text-xs font-bold bg-blue text-white px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      📐 Aide Visuelle Nécessaire
                    </span>
                  )}
                  {results.photo_upload_recommended && (
                    <span className="text-[10px] md:text-xs font-bold bg-accent text-white px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      📸 Envoi de Photo Recommandé
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-5xl md:text-6xl font-extrabold font-display text-ink">
                    {results.score_percent}
                  </span>
                  <span className="text-2xl md:text-3xl text-ink-2 font-bold">%</span>
                </div>

                {results.result_summary && (
                  <div className="max-w-xl mx-auto flex flex-col gap-2 mt-2">
                    <span className={`text-xs uppercase font-extrabold px-3 py-1 rounded-full self-center border ${
                      results.result_summary.overall_level === "strong" ? "bg-green/10 text-green border-green/20" :
                      results.result_summary.overall_level === "progressing" ? "bg-gold/10 text-gold border-gold/20" :
                      "bg-accent/10 text-accent border-accent/20"
                    }`}>
                      Niveau : {results.result_summary.overall_level}
                    </span>
                    <p className="text-sm md:text-base font-bold text-ink leading-relaxed mt-2 italic">
                      "{results.result_summary.student_message}"
                    </p>
                    <p className="text-xs md:text-sm text-ink-2 leading-relaxed mt-1">
                      <span className="font-bold text-ink">Message aux parents :</span> {results.result_summary.parent_message}
                    </p>
                  </div>
                )}

                {wasExplanationOpened && (
                  <div className="bg-gold/10 border border-gold/30 rounded-xl px-4 py-2.5 text-xs text-gold font-bold mt-3 max-w-md shadow-sm">
                    📖 Note : Certaines fiches d'explications ont été consultées pendant ce diagnostic.
                  </div>
                )}
              </div>

              {/* Strengths and Weaknesses lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="border border-paper-3 rounded-2xl p-5 flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-green uppercase tracking-wider border-b border-paper-3 pb-2 flex items-center gap-1.5">
                    <span>✅</span> Mes points forts
                  </h4>
                  {results.strengths && results.strengths.length > 0 ? (
                    <ul className="flex flex-col gap-2 flex-1">
                      {results.strengths.map((str) => (
                        <li key={str} className="text-sm font-semibold text-ink flex items-center gap-2">
                          <span className="text-green text-lg">•</span> {str.replace("_", " ")}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-ink-2 italic">Aucun point fort particulier détecté. Il faut s'entraîner !</p>
                  )}
                </div>

                {/* Weaknesses */}
                <div className="border border-paper-3 rounded-2xl p-5 flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-accent uppercase tracking-wider border-b border-paper-3 pb-2 flex items-center gap-1.5">
                    <span>❌</span> Mes faiblesses à travailler
                  </h4>
                  {results.weak_skills && results.weak_skills.length > 0 ? (
                    <ul className="flex flex-col gap-2 flex-1">
                      {results.weak_skills.map((wk) => (
                        <li key={wk} className="text-sm font-semibold text-ink flex items-center gap-2">
                          <span className="text-accent text-lg">•</span> {wk.replace("_", " ")}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-ink-2 italic">Félicitations ! Aucune faiblesse critique détectée.</p>
                  )}
                </div>
              </div>

              {/* Revision Cards Section */}
              {results.revision_notes_for_weak_skills && results.revision_notes_for_weak_skills.length > 0 && (
                <div className="flex flex-col gap-4 mt-4">
                  <h3 className="text-lg md:text-xl font-bold font-display text-ink">
                    📚 Fiches de révision & Coaching Adaptatif
                  </h3>
                  <div>
                    {results.revision_notes_for_weak_skills.map((note) => (
                      <PremiumTopicLessonCard key={note.topic_id} note={note} />
                    ))}
                  </div>
                </div>
              )}

              {/* Reinforcement Practice Plan */}
              {(results.reinforcement_plan || results.practice_plan) && (
                <div className="flex flex-col gap-4 mt-4">
                  <h3 className="text-lg md:text-xl font-bold font-display text-ink">
                    🏋️‍♂️ Ton Plan d'Entraînement Personnalisé
                  </h3>
                  <ReinforcementFlow plan={results.reinforcement_plan || results.practice_plan!} />
                </div>
              )}

              <button
                type="button"
                onClick={handleReset}
                className="bg-accent hover:bg-accent-dark text-white font-bold text-sm px-6 py-3 rounded-xl cursor-pointer self-center shadow-md transition-all"
              >
                Recommencer un diagnostic 🔄
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
