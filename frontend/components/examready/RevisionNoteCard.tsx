"use client";

import React, { useState } from "react";
import { RevisionNote } from "@/lib/examreadyZenApi";

interface RevisionNoteCardProps {
  note: RevisionNote;
}

export default function RevisionNoteCard({ note }: RevisionNoteCardProps) {
  const [showAnswer, setShowAnswer] = useState(false);

  const hasPhotoInstructions =
    note.when_to_upload_photo &&
    note.when_to_upload_photo !== "N/A" &&
    note.when_to_upload_photo !== "";

  return (
    <div className="bg-white rounded-2xl border border-paper-3 shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col mb-6">
      {/* Title Header */}
      <div className="bg-accent text-white p-5 flex flex-col gap-1">
        <span className="text-xs uppercase tracking-widest font-semibold text-accent-light bg-white/10 px-2.5 py-1 rounded-full self-start">
          Fiche de Révision
        </span>
        <h3 className="text-xl md:text-2xl font-bold font-display leading-tight">
          {note.title_for_student}
        </h3>
      </div>

      <div className="p-6 flex flex-col gap-6">
        {/* Very Easy Explanation */}
        <div className="bg-paper-2 rounded-xl p-4 border-l-4 border-accent">
          <h4 className="text-sm font-semibold text-accent uppercase tracking-wider mb-1">
            En quelques mots 💡
          </h4>
          <p className="text-ink text-sm md:text-base italic">
            "{note.very_easy_explanation}"
          </p>
        </div>

        {/* Two Column Layout for Rules and Worked Examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rules */}
          <div className="bg-green/5 border border-green/20 rounded-xl p-4 flex flex-col">
            <h4 className="text-sm font-bold text-green uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>📋</span> Règles à retenir
            </h4>
            <div className="text-ink text-sm whitespace-pre-line leading-relaxed flex-1">
              {note.all_rules_to_remember}
            </div>
          </div>

          {/* Worked Examples */}
          <div className="bg-blue/5 border border-blue/20 rounded-xl p-4 flex flex-col">
            <h4 className="text-sm font-bold text-blue uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>✍️</span> Exemple corrigé
            </h4>
            <div className="text-ink text-sm whitespace-pre-line leading-relaxed flex-1 font-mono bg-white/60 p-2.5 rounded-lg border border-blue/10">
              {note.worked_examples}
            </div>
          </div>
        </div>

        {/* Common Traps */}
        {note.common_traps && note.common_traps !== "N/A" && (
          <div className="bg-gold/5 border border-gold/20 rounded-xl p-4">
            <h4 className="text-sm font-bold text-gold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>⚠️</span> Pièges fréquents (Attention !)
            </h4>
            <p className="text-ink text-sm leading-relaxed">
              {note.common_traps}
            </p>
          </div>
        )}

        {/* Mini Practice Section */}
        {note.mini_practice_questions && note.mini_practice_questions !== "N/A" && (
          <div className="border border-paper-3 bg-paper/50 rounded-xl p-4 flex flex-col gap-3">
            <h4 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
              <span>🎯</span> Mini entraînement
            </h4>
            <div className="text-ink text-sm bg-white p-3 rounded-lg border border-paper-3 font-semibold">
              {note.mini_practice_questions}
            </div>
            
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowAnswer(!showAnswer)}
                className="text-xs font-semibold text-accent hover:text-accent-dark self-start flex items-center gap-1 transition-colors cursor-pointer"
              >
                {showAnswer ? "🙈 Masquer la réponse" : "👁️ Révéler la réponse & astuce"}
              </button>

              {showAnswer && (
                <div className="bg-green/10 border border-green/20 rounded-lg p-3 text-xs md:text-sm animate-fade-in flex flex-col gap-1.5">
                  <p className="text-green font-semibold">
                    Réponse correcte : <span className="font-mono bg-white px-2 py-0.5 rounded border border-green/10">{note.answer_key}</span>
                  </p>
                  {note.remediation_hint && (
                    <p className="text-ink leading-relaxed">
                      <span className="font-bold text-green">Astuce :</span> {note.remediation_hint}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Visual / Drawing Description if present */}
        {note.visual_description && note.visual_description !== "N/A" && note.visual_description !== "" && (
          <div className="bg-paper-2 border border-paper-3 rounded-xl p-4 flex flex-col gap-1">
            <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
              Aide Visuelle 📐
            </h4>
            <p className="text-ink-2 text-xs md:text-sm">
              {note.visual_description}
            </p>
          </div>
        )}

        {/* Camera snapshot recommendation if geometry/construction needs photo */}
        {hasPhotoInstructions && (
          <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 flex items-start gap-3">
            <span className="text-2xl">📸</span>
            <div className="flex flex-col gap-0.5">
              <h4 className="text-xs font-bold text-accent uppercase tracking-wider">
                Quand envoyer une photo ?
              </h4>
              <p className="text-ink text-xs leading-relaxed">
                {note.when_to_upload_photo}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
