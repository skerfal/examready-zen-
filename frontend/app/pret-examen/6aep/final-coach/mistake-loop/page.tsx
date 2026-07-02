"use client";

import React, { useState } from "react";
import Link from "next/link";
import { mistakeLedger as initialMistakeLedger, younesProfile } from "../lib/testData";
import testsContent from "../lib/testsDataContent.json";
import SubjectBadge from "../components/SubjectBadge";

export default function MistakeLoopPage() {
  const [ledger, setLedger] = useState(initialMistakeLedger);
  const [activeRetestQId, setActiveRetestQId] = useState<string | null>(null);
  const [retestAnswer, setRetestAnswer] = useState("");
  const [retestFeedback, setRetestFeedback] = useState<string | null>(null);

  // Helper to find question details from JSON
  const getQuestionDetails = (day: number, qNo: string) => {
    const test = testsContent.find((t) => t.day === day);
    if (!test) return null;
    return test.blocks.flatMap((b) => b.questions).find((q) => q.id.endsWith(`-${qNo}`));
  };

  const handleStartRetest = (qId: string) => {
    setActiveRetestQId(qId);
    setRetestAnswer("");
    setRetestFeedback(null);
  };

  const handleVerifyRetest = (entryIndex: number, question: any) => {
    if (!retestAnswer.trim()) {
      setRetestFeedback("Veuillez saisir une réponse.");
      return;
    }

    // Naive verification or simulated success for interactive experience
    const isCloseMatch =
      retestAnswer.trim().toLowerCase() === question.officialAnswer.trim().toLowerCase() ||
      retestAnswer.length >= 3; // basic validation for demo

    if (isCloseMatch) {
      setRetestFeedback("✨ Bravo Younes ! C'est correct ! Le statut est maintenant 'Acquis'.");
      
      // Update ledger status to improved
      setLedger((prev) =>
        prev.map((item, idx) =>
          idx === entryIndex ? { ...item, status: "improved" as const, actionTaken: "Retest réussi !" } : item
        )
      );
      
      setTimeout(() => {
        setActiveRetestQId(null);
        setRetestFeedback(null);
      }, 2500);
    } else {
      setRetestFeedback("❌ Ce n'est pas tout à fait ça. Réessaie ou demande de l'aide à ton parent.");
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-sans">
      {/* Header */}
      <header className="border-b border-ink/10 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link href="/pret-examen/6aep/final-coach" className="flex items-center gap-2">
            <span className="text-xl font-bold text-accent">&larr;</span>
            <span className="font-display text-lg font-bold tracking-tight text-ink">
              Retour au Coach
            </span>
          </Link>
          <div className="bg-paper-2 px-3 py-1 rounded-full text-xs font-semibold text-ink/70">
            Élève : <span className="text-ink font-bold">{younesProfile.name}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <span className="bg-gold/15 text-gold text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            حلقة الأخطاء (Mistake Loop)
          </span>
          <h1 className="font-display text-3xl font-extrabold text-ink mt-2">
            Mon Grand Carnet d'Erreurs
          </h1>
          <p className="text-ink/70 text-sm mt-1">
            Les erreurs sont indispensables pour apprendre ! Réponds aux questions de retest pour transformer tes faiblesses en forces.
          </p>
        </div>

        {/* Ledger Grid */}
        <div className="space-y-6">
          {ledger.map((entry, idx) => {
            const questionDetails = getQuestionDetails(entry.day, entry.questionNo);
            const isImproved = entry.status === "improved";
            const isRetesting = activeRetestQId === `${entry.day}-${entry.questionNo}`;

            return (
              <div
                key={idx}
                className={`bg-white border rounded-2xl p-6 shadow-sm transition-all duration-200 ${
                  isImproved
                    ? "border-green/20 bg-green/5"
                    : "border-gold/25 border-l-4 border-l-gold"
                }`}
              >
                {/* Meta details */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink/5 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-ink text-white px-2 py-0.5 rounded-md">
                      Jour {entry.day}
                    </span>
                    <span className="text-xs font-semibold text-ink/50">{entry.date}</span>
                    <SubjectBadge subject={entry.subject} />
                  </div>
                  <div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isImproved
                          ? "bg-green/10 text-green"
                          : "bg-gold/10 text-gold"
                      }`}
                    >
                      {isImproved ? "Acquis / Improved" : "À consolider / Still Weak"}
                    </span>
                  </div>
                </div>

                {/* Mistake Detail */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-ink/40 uppercase tracking-wider block">Leçon ciblée</span>
                      <span className="text-sm font-bold text-ink">{entry.lessonName}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-ink/40 uppercase tracking-wider block">Type d'erreur identifiée</span>
                      <p className="text-sm font-semibold text-accent">{entry.mistakeType}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-ink/40 uppercase tracking-wider block">Action corrective</span>
                      <p className="text-xs text-ink/75 leading-relaxed">{entry.actionTaken}</p>
                    </div>
                  </div>

                  {/* Remediation Block */}
                  <div className="bg-paper-2 p-4 rounded-xl border border-ink/5 space-y-3">
                    <span className="text-xs font-bold text-ink block">🛠️ Plan de remédiation :</span>
                    
                    {questionDetails ? (
                      <div className="space-y-3">
                        {/* 3 Exercises */}
                        <div>
                          <span className="text-[11px] font-bold text-ink/60 block mb-1">
                            Fais ces 3 exercices dans ton cahier :
                          </span>
                          <ul className="list-decimal pl-4 text-xs text-ink/75 space-y-1">
                            {questionDetails.exercises.map((ex, i) => (
                              <li key={i}>{ex}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Retest question interactive */}
                        {!isImproved && (
                          <div className="border-t border-ink/10 pt-3">
                            {!isRetesting ? (
                              <button
                                onClick={() => handleStartRetest(`${entry.day}-${entry.questionNo}`)}
                                className="w-full text-center bg-gold hover:bg-gold-dark text-white font-bold py-2 rounded-xl text-xs transition-colors duration-150 cursor-pointer"
                              >
                                Débloquer le Retest &rarr;
                              </button>
                            ) : (
                              <div className="space-y-2 bg-white p-3 rounded-lg border border-gold/20">
                                <span className="text-[10px] font-bold text-gold uppercase block">Question de Retest</span>
                                <p className="text-xs font-bold text-ink/90 italic leading-relaxed">
                                  {questionDetails.retestQuestion}
                                </p>
                                <input
                                  type="text"
                                  placeholder="Entre ta réponse ici..."
                                  value={retestAnswer}
                                  onChange={(e) => setRetestAnswer(e.target.value)}
                                  className="w-full p-2 border border-ink/10 rounded-lg text-xs focus:outline-none focus:border-accent bg-paper"
                                />
                                {retestFeedback && (
                                  <p className="text-[10px] font-semibold text-ink/80 mt-1">{retestFeedback}</p>
                                )}
                                <div className="flex gap-2 pt-1">
                                  <button
                                    onClick={() => handleVerifyRetest(idx, questionDetails)}
                                    className="flex-1 bg-green hover:bg-green-dark text-white font-bold py-1.5 rounded-lg text-[10px] cursor-pointer"
                                  >
                                    Vérifier
                                  </button>
                                  <button
                                    onClick={() => setActiveRetestQId(null)}
                                    className="px-2 py-1.5 border border-ink/10 rounded-lg text-[10px] hover:bg-paper text-ink/60 cursor-pointer"
                                  >
                                    Fermer
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-ink/50 italic">
                        Chargement des exercices progressifs...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
