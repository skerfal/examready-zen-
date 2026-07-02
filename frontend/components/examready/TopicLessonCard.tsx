"use client";

import React, { useState } from "react";
import { RevisionNote } from "@/lib/examreadyZenApi";
import WorkedExampleCard from "./WorkedExampleCard";
import CommonTrapsCard from "./CommonTrapsCard";
import VisualSupportCard from "./VisualSupportCard";

interface TopicLessonCardProps {
  note: RevisionNote;
}

type TabType = "concrete" | "visual" | "abstract" | "traps";

export default function TopicLessonCard({ note }: TopicLessonCardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("concrete");
  const [showSelfTestAnswer, setShowSelfTestAnswer] = useState(false);

  // Check if tabs are applicable
  const hasTraps = note.common_traps && note.common_traps !== "N/A" && note.common_traps !== "";
  const hasVisual = note.visual_description && note.visual_description !== "N/A" && note.visual_description !== "";

  return (
    <div className="bg-white rounded-3xl border border-paper-3 shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col mb-8">
      {/* Editorial Header */}
      <div className="bg-gradient-to-r from-accent to-accent-dark text-white p-6 flex flex-col gap-1">
        <span className="text-[10px] md:text-xs uppercase tracking-widest font-extrabold text-accent-light bg-white/10 px-3 py-1 rounded-full self-start">
          Fiche de Révision & Coaching Adaptatif
        </span>
        <h3 className="text-xl md:text-3xl font-bold font-display leading-tight mt-1">
          {note.title_for_student || note.topic_id.replace("_", " ")}
        </h3>
      </div>

      {/* Tab Selectors */}
      <div className="bg-paper-2 border-b border-paper-3 flex flex-wrap px-2 pt-2 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab("concrete")}
          className={`px-4 py-2.5 text-xs md:text-sm font-bold rounded-t-xl transition-all cursor-pointer ${
            activeTab === "concrete"
              ? "bg-white text-accent border-t-2 border-accent"
              : "text-ink-2 hover:bg-paper-3"
          }`}
        >
          💡 1. Comprendre (Mots simples)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("visual")}
          className={`px-4 py-2.5 text-xs md:text-sm font-bold rounded-t-xl transition-all cursor-pointer ${
            activeTab === "visual"
              ? "bg-white text-blue border-t-2 border-blue"
              : "text-ink-2 hover:bg-paper-3"
          }`}
        >
          📐 2. Aide Visuelle & Tracé
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("abstract")}
          className={`px-4 py-2.5 text-xs md:text-sm font-bold rounded-t-xl transition-all cursor-pointer ${
            activeTab === "abstract"
              ? "bg-white text-green border-t-2 border-green"
              : "text-ink-2 hover:bg-paper-3"
          }`}
        >
          📋 3. Méthode & Exercice
        </button>

        {hasTraps && (
          <button
            type="button"
            onClick={() => setActiveTab("traps")}
            className={`px-4 py-2.5 text-xs md:text-sm font-bold rounded-t-xl transition-all cursor-pointer ${
              activeTab === "traps"
                ? "bg-white text-gold border-t-2 border-gold"
                : "text-ink-2 hover:bg-paper-3"
            }`}
          >
            ⚠️ 4. Pièges à Éviter
          </button>
        )}
      </div>

      {/* Content Panels */}
      <div className="p-6">
        
        {/* TAB 1: CONCRETE (Simple explanation) */}
        {activeTab === "concrete" && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div className="bg-accent/5 rounded-2xl p-5 border-l-4 border-accent">
              <h4 className="text-xs uppercase font-extrabold tracking-wider text-accent mb-2">
                L'explication simple du coach 💡
              </h4>
              <p className="text-ink text-sm md:text-base leading-relaxed font-medium italic">
                "{note.very_easy_explanation || "Nous allons revoir cette compétence pas à pas ensemble."}"
              </p>
            </div>
            
            <div className="flex flex-col gap-2 mt-2">
              <h5 className="text-xs uppercase font-bold text-ink-2 tracking-wider">
                Pourquoi c'est important ?
              </h5>
              <p className="text-ink text-xs md:text-sm leading-relaxed">
                Cette notion est un point clé de l'examen. Comprendre l'analogie ci-dessus permet d'éviter de confondre les étapes mathématiques et te donne le déclic pour démarrer la résolution.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: VISUAL (Illustrations & Grids) */}
        {activeTab === "visual" && (
          <div className="animate-fade-in">
            <VisualSupportCard
              topicId={note.topic_id}
              visualDescription={note.visual_description}
              whenToUploadPhoto={note.when_to_upload_photo}
            />
          </div>
        )}

        {/* TAB 3: ABSTRACT (Method, Rules, Worked Example & Self test) */}
        {activeTab === "abstract" && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* Rules to Remember */}
            <div className="bg-green/5 border border-green/20 rounded-2xl p-5 flex flex-col">
              <h4 className="text-xs uppercase font-bold tracking-wider text-green mb-3 flex items-center gap-1.5">
                <span>📋</span> Règles Fondamentales
              </h4>
              <div className="text-ink text-sm whitespace-pre-line leading-relaxed font-medium">
                {note.all_rules_to_remember}
              </div>
            </div>

            {/* Worked Example Card */}
            <WorkedExampleCard exampleText={note.worked_examples} />

            {/* Mini Self-Test Practice */}
            {note.mini_practice_questions && note.mini_practice_questions !== "N/A" && (
              <div className="border border-paper-3 bg-paper/50 rounded-2xl p-5 flex flex-col gap-4">
                <h4 className="text-xs uppercase font-bold tracking-wider text-ink flex items-center gap-1.5">
                  <span>🎯</span> Teste tes connaissances
                </h4>
                
                <div className="bg-white p-4 rounded-xl border border-paper-3 font-semibold text-sm text-ink leading-relaxed">
                  {note.mini_practice_questions}
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSelfTestAnswer(!showSelfTestAnswer)}
                    className="text-xs font-bold text-accent hover:text-accent-dark self-start flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {showSelfTestAnswer ? "🙈 Masquer la correction" : "👁️ Vérifier ma réponse"}
                  </button>

                  {showSelfTestAnswer && (
                    <div className="bg-green/10 border border-green/20 rounded-xl p-4 text-xs md:text-sm animate-fade-in flex flex-col gap-2">
                      <p className="text-green font-bold flex items-center gap-1">
                        <span>Réponse attendue :</span>
                        <span className="font-mono bg-white px-2.5 py-0.5 rounded border border-green/10 text-ink">
                          {note.answer_key}
                        </span>
                      </p>
                      {note.remediation_hint && (
                        <p className="text-ink leading-relaxed border-t border-green/20 pt-2 mt-1">
                          <span className="font-bold text-green">Astuce de calcul :</span> {note.remediation_hint}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: TRAPS (Visual warnings) */}
        {activeTab === "traps" && (
          <div className="animate-fade-in">
            <CommonTrapsCard trapsText={note.common_traps} />
          </div>
        )}

      </div>
    </div>
  );
}
