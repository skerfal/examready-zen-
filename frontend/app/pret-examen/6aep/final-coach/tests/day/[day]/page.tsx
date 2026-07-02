"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { dailyTestsMetadata, younesProfile } from "../../../lib/testData";
import { getExamTestForDayAndVersion } from "../../../lib/examQuestionBank";
import SubjectBadge from "../../../components/SubjectBadge";
import CalmBreathingBox from "../../../components/CalmBreathingBox";

interface SavedAttempt {
  attemptNumber: number;
  version: 'A' | 'B' | 'C';
  date: string;
  score: string;
  correctCount: number;
  totalQuestions: number;
  weakTopics: string[];
  sourceTypes: string[];
}

export default function DayTestPage() {
  const params = useParams();
  const dayNum = parseInt(params.day as string) || 1;

  const meta = dailyTestsMetadata.find((t) => t.day === dayNum);

  // Core state for multiple versions and attempts
  const [version, setVersion] = useState<'A' | 'B' | 'C'>('A');
  const [attempt, setAttempt] = useState(1);
  const [attemptsList, setAttemptsList] = useState<SavedAttempt[]>([]);
  const [isStarted, setIsStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeBlockIndex, setActiveBlockIndex] = useState(0);
  const [collapsedBlocks, setCollapsedBlocks] = useState<Record<string, boolean>>({});

  // Dynamic test data loaded from the exam question bank
  const testData = getExamTestForDayAndVersion(dayNum, version);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [grading, setGrading] = useState<Record<string, boolean>>({});
  const [retestAnswers, setRetestAnswers] = useState<Record<string, string>>({});
  const [mistakeStatuses, setMistakeStatuses] = useState<Record<string, "improved" | "still weak">>({});

  // Load attempt history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`iqraa_day_${dayNum}_attempts`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAttemptsList(parsed);
        setAttempt(parsed.length + 1);
        
        if (parsed.length > 0) {
          setVersion(parsed[parsed.length - 1].version);
        }
      } catch (e) {
        console.error(e);
      }
    } else if (meta?.status === "completed") {
      const mockAttempt: SavedAttempt = {
        attemptNumber: 1,
        version: 'A',
        date: "18 Juin 2026",
        score: "7/9",
        correctCount: 7,
        totalQuestions: 9,
        weakTopics: ["Decimal brackets", "Quran spelling"],
        sourceTypes: ["real_exam", "adapted_from_real_exam"]
      };
      setAttemptsList([mockAttempt]);
      setAttempt(2);
      localStorage.setItem(`iqraa_day_${dayNum}_attempts`, JSON.stringify([mockAttempt]));
    }
  }, [dayNum, meta]);

  if (!testData || !meta) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center font-sans">
        <div className="bg-white border border-ink/10 rounded-2xl p-6 text-center max-w-sm">
          <p className="text-sm font-semibold text-ink">Test du jour {dayNum} introuvable.</p>
          <Link href="/pret-examen/6aep/final-coach/tests" className="mt-4 inline-block bg-accent px-4 py-2 rounded-xl text-white text-xs font-bold">
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  const handleStart = () => {
    setIsStarted(true);
    setAnswers({});
    setGrading({});
    setRetestAnswers({});
    setMistakeStatuses({});
    setActiveBlockIndex(0);
  };

  const handleAnswerChange = (qId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: value,
    }));
  };

  const handleNextBlock = () => {
    if (activeBlockIndex < testData.blocks.length - 1) {
      setActiveBlockIndex((prev) => prev + 1);
    }
  };

  const handlePrevBlock = () => {
    if (activeBlockIndex > 0) {
      setActiveBlockIndex((prev) => prev - 1);
    }
  };

  // Submit test and calculate final scores
  const handleSubmit = () => {
    const allQuestions = testData.blocks.flatMap((b) => b.questions);
    const unanswered = allQuestions.filter((q) => !answers[q.id]?.trim());
    if (unanswered.length > 0) {
      if (!confirm(`Il te reste ${unanswered.length} question(s) sans réponse. Veux-tu vraiment soumettre ?`)) {
        return;
      }
    }
    setIsSubmitted(true);
    
    const initialGrading: Record<string, boolean> = {};
    allQuestions.forEach((q) => {
      const isCorrect = answers[q.id]?.trim().toLowerCase() === q.officialAnswer.trim().toLowerCase();
      initialGrading[q.id] = isCorrect;
    });
    setGrading(initialGrading);
  };

  // Confirm and save attempt to localStorage log
  const handleSaveAttempt = () => {
    const allQuestions = testData.blocks.flatMap((b) => b.questions);
    const correctCount = Object.values(grading).filter(Boolean).length;
    const totalQuestionsCount = allQuestions.length;
    
    const weakTopics: string[] = [];
    const sourceTypes: string[] = [];
    
    testData.blocks.forEach((block) => {
      const hasErrors = block.questions.some((q) => grading[q.id] === false);
      if (hasErrors) {
        weakTopics.push(`${block.subject} (L. ${block.objective.slice(0, 15)}...)`);
      }
      block.questions.forEach((q) => {
        if (!sourceTypes.includes(q.sourceType)) {
          sourceTypes.push(q.sourceType);
        }
      });
    });

    const newAttempt: SavedAttempt = {
      attemptNumber: attempt,
      version: version,
      date: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long" }),
      score: `${correctCount}/${totalQuestionsCount}`,
      correctCount,
      totalQuestions: totalQuestionsCount,
      weakTopics,
      sourceTypes
    };

    const updatedList = [...attemptsList, newAttempt];
    setAttemptsList(updatedList);
    setAttempt(updatedList.length + 1);
    localStorage.setItem(`iqraa_day_${dayNum}_attempts`, JSON.stringify(updatedList));

    setIsStarted(false);
    setIsSubmitted(false);
  };

  const toggleGrading = (qId: string, isCorrect: boolean) => {
    setGrading((prev) => ({
      ...prev,
      [qId]: isCorrect,
    }));
  };

  const handleMistakeStatusChange = (qId: string, status: "improved" | "still weak") => {
    setMistakeStatuses((prev) => ({
      ...prev,
      [qId]: status,
    }));
  };

  const handleRetestAnswerChange = (qId: string, val: string) => {
    setRetestAnswers((prev) => ({
      ...prev,
      [qId]: val,
    }));
  };

  const toggleBlockCollapse = (subjName: string) => {
    setCollapsedBlocks((prev) => ({
      ...prev,
      [subjName]: !prev[subjName],
    }));
  };

  // Calculations for attempts list
  const bestAttempt = attemptsList.reduce((best, curr) => {
    if (!best) return curr;
    const bestRatio = best.correctCount / best.totalQuestions;
    const currRatio = curr.correctCount / curr.totalQuestions;
    return currRatio > bestRatio ? curr : best;
  }, null as SavedAttempt | null);

  const latestAttempt = attemptsList.length > 0 ? attemptsList[attemptsList.length - 1] : null;

  const allQuestions = testData.blocks.flatMap((b) => b.questions);
  const correctCount = Object.values(grading).filter(Boolean).length;
  const totalQuestionsCount = allQuestions.length;

  const getBlockScore = (block: any) => {
    const blockQuestions = block.questions;
    const blockCorrect = blockQuestions.filter((q: any) => grading[q.id] !== false).length;
    return `${blockCorrect}/${blockQuestions.length}`;
  };

  const activeBlock = testData.blocks[activeBlockIndex];

  const getSubjectColorTheme = (subject: string) => {
    if (subject === "Mathématiques") return { bg: "bg-blue/5 border-blue/10", text: "text-blue", pill: "bg-blue text-white" };
    if (subject === "Français") return { bg: "bg-accent/5 border-accent/10", text: "text-accent", pill: "bg-accent text-white" };
    if (subject === "Langue Arabe") return { bg: "bg-gold/5 border-gold/10", text: "text-gold", pill: "bg-gold text-white" };
    return { bg: "bg-green/5 border-green/10", text: "text-green", pill: "bg-green text-white" };
  };

  const getSourceTypeLabel = (sourceType: string) => {
    if (sourceType === "real_exam") return "📜 Examen régional réel";
    if (sourceType === "adapted_from_real_exam") return "✏️ Adapté d'examen réel";
    return "⚙️ Type examen généré";
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-sans">
      {/* Header */}
      <header className="border-b border-ink/10 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link href="/pret-examen/6aep/final-coach/tests" className="flex items-center gap-2">
            <span className="text-xl font-bold text-accent">&larr;</span>
            <span className="font-display text-lg font-bold tracking-tight text-ink">
              Tous les Tests
            </span>
          </Link>
          <div className="bg-paper-2 px-3 py-1 rounded-full text-xs font-semibold text-ink/70">
            Jour {testData.day} &middot; <span className="text-ink font-bold">{meta.date}</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {!isStarted && !isSubmitted ? (
          /* Start Card & Version Generator */
          <div className="space-y-6">
            <div className="bg-white border border-ink/10 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 bg-accent/5 w-32 h-32 rounded-bl-full flex items-center justify-center">
                <span className="text-3xl">📜</span>
              </div>
              <span className="bg-accent/15 text-accent text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Nouvelle version type examen &middot; Entraînement examen régional
              </span>
              <h1 className="font-display text-3xl font-extrabold text-ink mt-3">
                Préparation du Jour {testData.day}
              </h1>
              <p className="text-ink/80 text-sm mt-3 leading-relaxed max-w-xl">
                Toutes les questions générées proviennent **uniquement** d'anciens examens régionaux marocains réels (ou sont adaptées strictement sur le même format).
              </p>

              {/* Version Selector Tabs */}
              <div className="mt-6">
                <span className="text-xs font-bold text-ink/40 uppercase tracking-wider block mb-2">Choisir la version du test</span>
                <div className="grid grid-cols-3 gap-2 bg-paper-2 p-1.5 rounded-2xl border border-ink/5">
                  {(['A', 'B', 'C'] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setVersion(v)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                        version === v
                          ? "bg-white text-ink shadow-sm"
                          : "text-ink/50 hover:text-ink hover:bg-white/50"
                      }`}
                    >
                      {v === 'A' 
                        ? "Version A — Test standard" 
                        : v === 'B' 
                        ? "Version B — Test type examen régional" 
                        : "Version C — Défi examen"}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-ink/65 mt-2.5 font-medium leading-relaxed">
                  Chaque version garde les mêmes leçons du jour, mais propose de nouvelles questions type examen.
                </p>
              </div>

              {/* Stats and Attempt History Tracker */}
              {attemptsList.length > 0 && (
                <div className="bg-paper p-5 rounded-2xl border border-ink/5 mt-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-ink/5 pb-3">
                    <span className="text-xs font-bold text-ink/65">Historique des tentatives</span>
                    <span className="text-[10px] font-extrabold bg-green/10 text-green px-2 py-0.5 rounded-md">
                      {attemptsList.length} Tentatives aujourd'hui
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-xl border border-ink/5">
                      <span className="text-[10px] text-ink/40 block font-semibold">Meilleur score</span>
                      <span className="text-base font-extrabold text-green mt-0.5 block">{bestAttempt?.score}</span>
                      <span className="text-[9px] text-ink/50">Version {bestAttempt?.version}</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-ink/5">
                      <span className="text-[10px] text-ink/40 block font-semibold">Dernier score</span>
                      <span className="text-base font-extrabold text-ink mt-0.5 block">{latestAttempt?.score}</span>
                      <span className="text-[9px] text-ink/50">Version {latestAttempt?.version}</span>
                    </div>
                  </div>

                  <div className="space-y-2 mt-3 pt-2">
                    {attemptsList.map((att) => (
                      <div key={att.attemptNumber} className="flex items-center justify-between text-xs bg-white/70 p-2.5 rounded-lg border border-ink/5">
                        <span className="font-bold text-ink">Tentative #{att.attemptNumber} (Version {att.version})</span>
                        <div className="flex items-center gap-3">
                          <span className="text-ink/50 text-[10px]">{att.date}</span>
                          <span className="font-extrabold text-accent">{att.score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subject Blocks Overview */}
              <div className="mt-6 pt-6 border-t border-ink/5 space-y-3">
                <span className="text-xs font-bold text-ink/40 uppercase tracking-wider block">Structure des blocs de la version {version}</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {testData.blocks.map((block, i) => {
                    const theme = getSubjectColorTheme(block.subject);
                    return (
                      <div key={i} className={`p-4 rounded-xl border ${theme.bg} flex items-start gap-3`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs ${theme.pill}`}>
                          {i + 1}
                        </span>
                        <div>
                          <span className={`text-xs font-bold ${theme.text}`}>{block.subject}</span>
                          <p className="text-[11px] text-ink/75 mt-0.5 font-medium">{block.objective}</p>
                          <span className="text-[10px] text-ink/40 block mt-1">⏳ Durée : {block.estimatedDuration}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Parent advice */}
              <div className="space-y-3 mt-6 p-4 bg-paper-2 rounded-2xl border border-ink/5">
                <div>
                  <span className="text-xs font-bold text-accent uppercase tracking-wider block">💡 Conseil Parent / Enseignant</span>
                  <p className="text-xs text-ink/85 mt-1">{meta.parentNote}</p>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleStart}
                  className="flex-1 text-center bg-accent hover:bg-accent-dark text-white font-bold py-3.5 rounded-2xl text-sm transition-colors duration-150 cursor-pointer shadow-md shadow-accent/10"
                >
                  Démarrer le test (Version {version}) &rarr;
                </button>
              </div>
            </div>

            <CalmBreathingBox />
          </div>
        ) : isStarted && !isSubmitted ? (
          /* Active Question Paper by Blocks */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              {/* Block Progress indicator */}
              <div className="bg-white border border-ink/10 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] font-bold text-ink/40 uppercase block">Version {version} &middot; Tentative #{attempt}</span>
                  <span className="text-sm font-bold text-ink mt-0.5 block">
                    Bloc {activeBlockIndex + 1} sur {testData.blocks.length} : <span className="text-accent">{activeBlock.subject}</span>
                  </span>
                </div>
                <span className="bg-accent/10 text-accent text-xs font-extrabold px-3 py-1 rounded-full uppercase">
                  {activeBlockIndex + 1} / {testData.blocks.length}
                </span>
              </div>

              {/* Active Subject Block Card */}
              <div className="space-y-4">
                <div className="bg-white border border-ink/10 rounded-2xl p-5 shadow-sm">
                  <span className="bg-ink/5 text-ink/65 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {activeBlock.title}
                  </span>
                  <h3 className="font-display text-xl font-bold text-ink mt-2">{activeBlock.subject}</h3>
                  <p className="text-xs text-ink/75 mt-1">
                    <span className="font-bold text-ink">Objectif :</span> {activeBlock.objective} &middot; <span className="text-ink/50">⏳ {activeBlock.estimatedDuration}</span>
                  </p>
                </div>

                {/* Block Questions */}
                {activeBlock.questions.map((q, idx) => {
                  const isAr = !!q.arabicText;
                  return (
                    <div
                      key={q.id}
                      className="bg-white border border-ink/10 rounded-2xl p-5 shadow-sm hover:border-ink/20 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-3.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold bg-ink text-white w-7 h-7 rounded-full flex items-center justify-center">
                            {q.id.split("-Q")[1]}
                          </span>
                          <span className="text-[9px] font-bold text-ink/40 bg-paper px-2 py-0.5 rounded border border-ink/5">
                            {getSourceTypeLabel(q.sourceType)}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                            q.type === "easy"
                              ? "bg-green/10 text-green"
                              : q.type === "medium"
                              ? "bg-blue/10 text-blue"
                              : "bg-accent/10 text-accent"
                          }`}
                        >
                          {q.type}
                        </span>
                      </div>

                      <div className={`${isAr ? "text-right dir-rtl font-sans" : "text-left font-sans"} text-sm sm:text-base font-semibold text-ink leading-relaxed mb-4`}>
                        {q.text}
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-ink/40 uppercase block mb-1">
                          {q.answerSpace}
                        </label>
                        <textarea
                          value={answers[q.id] || ""}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          placeholder={isAr ? "اكتب جوابك هنا..." : "Écris ta réponse ici..."}
                          dir={isAr ? "rtl" : "ltr"}
                          rows={q.type === "easy" ? 2 : 4}
                          className="w-full rounded-xl border border-ink/10 bg-paper-2 p-3 text-sm focus:outline-none focus:border-accent focus:bg-white transition-all duration-200"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between gap-4 pt-4">
                <button
                  onClick={handlePrevBlock}
                  disabled={activeBlockIndex === 0}
                  className={`flex-1 text-center font-bold py-3.5 rounded-2xl text-xs transition-colors duration-150 cursor-pointer ${
                    activeBlockIndex === 0
                      ? "bg-paper-3 text-ink/30 cursor-not-allowed border border-ink/5"
                      : "bg-white border border-ink/20 text-ink hover:bg-paper-2"
                  }`}
                >
                  &larr; Bloc Précédent
                </button>

                {activeBlockIndex < testData.blocks.length - 1 ? (
                  <button
                    onClick={handleNextBlock}
                    className="flex-1 text-center bg-ink hover:bg-ink-2 text-white font-bold py-3.5 rounded-2xl text-xs transition-colors duration-150 cursor-pointer shadow-sm"
                  >
                    Bloc Suivant &rarr;
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="flex-1 text-center bg-accent hover:bg-accent-dark text-white font-bold py-3.5 rounded-2xl text-xs transition-colors duration-150 cursor-pointer shadow-md shadow-accent/10"
                  >
                    Terminer et Soumettre &rarr;
                  </button>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <CalmBreathingBox />

              {/* Navigation Tab links */}
              <div className="bg-white border border-ink/10 rounded-2xl p-4 shadow-sm space-y-2">
                <h4 className="font-display font-bold text-ink text-xs uppercase tracking-wider mb-2.5 text-ink/40">Sommaire des Blocs</h4>
                {testData.blocks.map((block, idx) => {
                  const isActive = idx === activeBlockIndex;
                  const theme = getSubjectColorTheme(block.subject);
                  const isBlockFilled = block.questions.every((q) => answers[q.id]?.trim());

                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveBlockIndex(idx)}
                      className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold transition-all duration-150 cursor-pointer ${
                        isActive
                          ? `border-accent bg-accent/5 ${theme.text}`
                          : "border-ink/5 bg-paper hover:bg-paper-2 text-ink/70"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${theme.pill}`}>
                          {idx + 1}
                        </span>
                        {block.subject}
                      </span>
                      <span className="text-[10px]">
                        {isBlockFilled ? "🟢 Fini" : "⚪ En cours"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Completion Report and Interactive Parent Grading Assistant sorted by blocks */
          <div className="space-y-8">
            {/* Top Score banner */}
            <div className="bg-gradient-to-br from-green to-ink text-white rounded-3xl p-6 sm:p-8 shadow-sm text-center relative overflow-hidden">
              <span className="bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Tentative #{attempt} &middot; Version {version} Soumise
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-extrabold mt-4">
                Score : {correctCount} / {totalQuestionsCount}
              </h1>
              
              {/* Detailed block scores list */}
              <div className="flex flex-wrap justify-center gap-3 mt-4 text-xs">
                {testData.blocks.map((block, i) => (
                  <span key={i} className="bg-white/10 px-3 py-1 rounded-full font-bold">
                    {block.subject} : {getBlockScore(block)}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={handleSaveAttempt}
                  className="bg-white text-ink text-xs font-bold px-4 py-2 rounded-xl hover:bg-paper-2 transition-colors duration-150 cursor-pointer shadow-sm"
                >
                  Confirmer et Enregistrer la tentative
                </button>
              </div>
            </div>

            {/* Parent Grading Assistant Section grouped by subject block */}
            <div className="space-y-8">
              <h2 className="font-display text-2xl font-bold text-ink flex items-center gap-2">
                <span>👨‍🏫</span> Assistant de Correction par Matière (Espace Parent)
              </h2>

              {testData.blocks.map((block, bIdx) => {
                const isCollapsed = collapsedBlocks[block.subject] === true;
                const theme = getSubjectColorTheme(block.subject);

                return (
                  <div key={bIdx} className="bg-white border border-ink/10 rounded-2xl shadow-sm overflow-hidden">
                    {/* Block Header */}
                    <div
                      onClick={() => toggleBlockCollapse(block.subject)}
                      className={`px-5 py-4 border-b border-ink/5 ${theme.bg} flex items-center justify-between cursor-pointer select-none`}
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Bloc {bIdx + 1}</span>
                        <h3 className={`font-display text-lg font-bold ${theme.text} mt-0.5`}>
                          {block.subject} &middot; <span className="text-xs font-sans font-semibold text-ink/60">Score: {getBlockScore(block)}</span>
                        </h3>
                      </div>
                      <button className="text-sm font-bold text-ink/50 hover:text-ink">
                        {isCollapsed ? "Afficher ▾" : "Masquer ▴"}
                      </button>
                    </div>

                    {/* Block Questions Correction */}
                    {!isCollapsed && (
                      <div className="p-5 space-y-6 divide-y divide-ink/5">
                        {block.questions.map((q, idx) => {
                          const isCorrect = grading[q.id] !== false;
                          const studentAns = answers[q.id] || "Aucune réponse fournie";
                          const isAr = !!q.arabicText;

                          return (
                            <div
                              key={q.id}
                              className={`pt-5 first:pt-0 space-y-3`}
                            >
                              <div className="flex items-center justify-between pb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold bg-ink text-white w-6 h-6 rounded-full flex items-center justify-center">
                                    {q.id.split("-Q")[1]}
                                  </span>
                                  <span className="text-[9px] font-semibold text-ink/40">
                                    Question {q.id} &middot; {getSourceTypeLabel(q.sourceType)}
                                  </span>
                                </div>

                                {/* Correct/Incorrect toggles */}
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => toggleGrading(q.id, true)}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all duration-150 cursor-pointer ${
                                      isCorrect
                                        ? "bg-green text-white"
                                        : "bg-paper-2 text-ink/50 hover:bg-green/10 hover:text-green"
                                    }`}
                                  >
                                    ✓ Correct
                                  </button>
                                  <button
                                    onClick={() => toggleGrading(q.id, false)}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all duration-150 cursor-pointer ${
                                      !isCorrect
                                        ? "bg-gold text-white"
                                        : "bg-paper-2 text-ink/50 hover:bg-gold/10 hover:text-gold"
                                    }`}
                                  >
                                    ✗ Incorrect
                                  </button>
                                </div>
                              </div>

                              {/* Question text */}
                              <div className={`${isAr ? "text-right dir-rtl font-sans" : "text-left font-sans"} text-sm font-semibold text-ink/80 leading-relaxed`}>
                                {q.text}
                              </div>

                              {/* Younes Answer */}
                              <div className="bg-paper-2 p-3 rounded-xl border border-ink/5">
                                <span className="text-[9px] font-bold text-ink/40 uppercase block mb-1">Réponse de Younes</span>
                                <p className={`text-xs font-bold text-ink leading-relaxed ${isAr ? "text-right dir-rtl" : ""}`}>
                                  {studentAns}
                                </p>
                              </div>

                              {/* Official Correction */}
                              <div className="bg-blue/5 p-3 rounded-xl border border-blue/10">
                                <span className="text-[9px] font-bold text-blue uppercase block mb-1">Correction Officielle</span>
                                <p className={`text-xs font-bold text-blue leading-relaxed ${isAr ? "text-right dir-rtl" : ""}`}>
                                  {q.officialAnswer}
                                </p>
                                {q.explanation && (
                                  <p className="text-[11px] text-ink/75 mt-2 pt-2 border-t border-blue/10">
                                    <span className="font-bold text-ink">Explication :</span> {q.explanation}
                                  </p>
                                )}
                              </div>

                              {/* Remediation Routing */}
                              {!isCorrect && (
                                <div className="bg-gold/5 p-3.5 rounded-xl border border-gold/10 space-y-3">
                                  <span className="bg-gold/15 text-gold text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider block w-max">
                                    Remédiation &middot; حلقة الأخطاء
                                  </span>
                                  <div>
                                    <span className="text-[10px] font-bold text-ink block">📍 Leçon à revoir :</span>
                                    <span className="text-xs text-accent font-semibold">{q.mistakeRouting}</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] font-bold text-ink block mb-1">📋 3 Exercices d'entraînement :</span>
                                    <ol className="list-decimal pl-4 text-xs text-ink/75 space-y-1">
                                      {q.exercises.map((ex, i) => (
                                        <li key={i}>{ex}</li>
                                      ))}
                                    </ol>
                                  </div>
                                  <div className="bg-white p-3 rounded-lg border border-gold/10">
                                    <span className="text-[10px] font-bold text-ink block mb-1">🔄 Question de Retest :</span>
                                    <p className="text-xs font-bold text-ink/90 italic mb-2">{q.retestQuestion}</p>
                                    <input
                                      type="text"
                                      placeholder="Réponse de Younes..."
                                      value={retestAnswers[q.id] || ""}
                                      onChange={(e) => handleRetestAnswerChange(q.id, e.target.value)}
                                      className="w-full p-2 border border-ink/10 rounded-lg text-xs bg-paper focus:outline-none"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2 pt-1">
                                    <span className="text-xs font-bold text-ink">Statut après remédiation :</span>
                                    <button
                                      onClick={() => handleMistakeStatusChange(q.id, "improved")}
                                      className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all duration-150 ${
                                        mistakeStatuses[q.id] === "improved"
                                          ? "bg-green text-white"
                                          : "bg-paper-2 text-ink/60 hover:bg-green/10"
                                      }`}
                                    >
                                      Acquis
                                    </button>
                                    <button
                                      onClick={() => handleMistakeStatusChange(q.id, "still weak")}
                                      className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all duration-150 ${
                                        mistakeStatuses[q.id] !== "improved"
                                          ? "bg-gold text-white"
                                          : "bg-paper-2 text-ink/60 hover:bg-gold/10"
                                      }`}
                                    >
                                      Toujours faible
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row gap-4 border-t border-ink/10 pt-6">
              <button
                onClick={handleSaveAttempt}
                className="flex-1 text-center bg-ink hover:bg-ink-2 text-white font-bold py-3.5 rounded-2xl text-xs transition-colors duration-150 cursor-pointer shadow-sm"
              >
                ✓ Terminer et quitter la correction
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
