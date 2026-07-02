"use client";

import React, { useState } from "react";

interface GuidedPracticeCardProps {
  questionText: string;
  answerKey: string;
  remediationHint?: string;
  topicId: string;
}

export default function GuidedPracticeCard({
  questionText,
  answerKey,
  remediationHint = "",
  topicId
}: GuidedPracticeCardProps) {
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  // If question is not valid, skip rendering
  if (!questionText || questionText === "N/A" || questionText === "") {
    return null;
  }

  return (
    <div className="border border-paper-3 bg-paper/55 rounded-3xl p-5 flex flex-col gap-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="bg-accent text-white font-extrabold w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-md shrink-0">
          🎯
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-extrabold text-ink-2 uppercase tracking-wider">
            Mini Défi d'Entraînement
          </span>
          <h4 className="text-xs font-bold text-ink-2">
            Teste tes connaissances immédiatement !
          </h4>
        </div>
      </div>

      {/* Question Text Box */}
      <div className="bg-white p-4 rounded-2xl border border-paper-3 font-semibold text-sm text-ink leading-relaxed shadow-inner">
        {questionText}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2.5">
        {remediationHint && remediationHint !== "N/A" && (
          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            className="bg-white hover:bg-paper-2 text-ink text-xs font-bold px-4 py-2.5 rounded-xl border border-paper-3 transition-colors cursor-pointer flex items-center gap-1 shadow-sm active:scale-95"
          >
            <span>💡</span> {showHint ? "Masquer l'astuce" : "Besoin d'un indice ?"}
          </button>
        )}

        <button
          type="button"
          onClick={() => setShowAnswer(!showAnswer)}
          className="bg-accent hover:bg-accent-dark text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-md active:scale-95"
        >
          {showAnswer ? "🙈 Masquer la solution" : "👁️ Révéler la solution"}
        </button>
      </div>

      {/* Hint Panel */}
      {showHint && remediationHint && (
        <div className="bg-blue/5 border border-dashed border-blue/20 rounded-xl p-4 text-xs md:text-sm text-ink leading-relaxed animate-fade-in">
          <span className="font-bold text-blue">Indice du coach :</span> {remediationHint}
        </div>
      )}

      {/* Answer / Explanation Panel */}
      {showAnswer && (
        <div className="bg-green/10 border border-green/20 rounded-2xl p-4 text-xs md:text-sm animate-fade-in flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="bg-green text-white font-extrabold w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 shadow-sm">
              ✓
            </span>
            <p className="text-green font-extrabold text-sm flex items-center gap-1.5 flex-wrap">
              <span>Réponse attendue :</span>
              <span className="font-mono bg-white px-3 py-1 rounded-lg border border-green/10 text-ink shadow-sm">
                {answerKey}
              </span>
            </p>
          </div>

          <div className="border-t border-green/20 pt-2.5 text-xs text-ink-2 leading-relaxed">
            <span className="font-bold text-green">Pourquoi c'est la bonne réponse ?</span>
            <p className="mt-1">
              En suivant la méthode pas à pas vue ci-dessus, vous parvenez précisément à ce résultat. Révisez les règles de calcul si votre réponse diffère.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
