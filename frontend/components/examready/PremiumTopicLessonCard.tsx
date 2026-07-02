"use client";

import React, { useState } from "react";
import { RevisionNote } from "@/lib/examreadyZenApi";
import ConceptHeroVisual from "./ConceptHeroVisual";
import StepByStepMethod from "./StepByStepMethod";
import MistakeComparisonCard from "./MistakeComparisonCard";
import GuidedPracticeCard from "./GuidedPracticeCard";
import PedagogyMethodBadge from "./PedagogyMethodBadge";
import MethodologySourcePanel from "./MethodologySourcePanel";

interface PremiumTopicLessonCardProps {
  note: RevisionNote;
  initialTab?: "concrete" | "visual" | "abstract";
}

type TabType = "concrete" | "visual" | "abstract";

export default function PremiumTopicLessonCard({ note, initialTab }: PremiumTopicLessonCardProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab || "concrete");

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const tId = note.topic_id.toLowerCase();

  // Pedagogical content resolvers
  let bigIdea = "Comprendre et appliquer cette notion clé pour l'examen.";
  let realLife = "Utile pour résoudre des problèmes du quotidien et des défis logiques.";
  let memoryRule = "Relisez l'énoncé attentivement et posez vos calculs au brouillon.";
  let topicIcon = "🧠";
  let whyItMatters = "Cette notion est un pilier de l'examen régional de Mathématiques 6AEP.";

  // Custom metadata based on topic IDs
  if (tId.includes("decimal_subtraction") || tId.includes("soustraction_decimale")) {
    bigIdea = "Soustraire des nombres à virgule avec une précision parfaite.";
    realLife = "Imagine que tu as un ruban de 47,55 cm et que tu en coupes 12,45 cm. Combien te reste-t-il ?";
    memoryRule = "Virgule sous virgule, et des zéros pour combler les trous !";
    topicIcon = "➖";
    whyItMatters = "Présent dans la première question de calcul de l'examen régional (généralement sur 3 points).";
  } else if (tId.includes("ordering_numbers") || tId.includes("ordre") || tId.includes("comparaison")) {
    bigIdea = "Classer des nombres entiers, décimaux et fractions dans le bon ordre.";
    realLife = "Classer la taille de plusieurs élèves ou des prix de jouets du plus cher au moins cher.";
    memoryRule = "Écris tous les nombres avec le même nombre de chiffres après la virgule !";
    topicIcon = "🔢";
    whyItMatters = "La toute première question de l'épreuve de mathématiques. Facile à réussir avec la bonne méthode !";
  } else if (tId.includes("angle") || tId.includes("bissectrice") || tId.includes("rapporteur")) {
    bigIdea = "Tracer ou mesurer un angle avec le rapporteur et tracer sa bissectrice.";
    realLife = "Partager une pizza ou une tarte en deux parts de tailles rigoureusement identiques.";
    memoryRule = "Centre du rapporteur sur le sommet, ligne du 0° sur le côté de l'angle !";
    topicIcon = "📐";
    whyItMatters = "Question phare du domaine de la géométrie, exigeant de la précision géométrique sur papier.";
  } else if (tId.includes("fraction") || tId.includes("partage")) {
    bigIdea = "Comprendre les fractions comme le partage équitable d'une unité.";
    realLife = "Diviser une tablette de chocolat de 12 carrés avec tes camarades de classe.";
    memoryRule = "Numérateur (haut) = parts choisies ; Dénominateur (bas) = total des parts.";
    topicIcon = "🍕";
    whyItMatters = "Indispensable pour réussir les calculs de fractions combinés de l'examen.";
  } else if (tId.includes("conversion") || tId.includes("mesure") || tId.includes("unite")) {
    bigIdea = "Convertir des unités de mesure (longueur, surface, volume, masse) sans se tromper.";
    realLife = "Savoir si une bouteille de 1,5 L peut contenir 150 cl de jus d'orange.";
    memoryRule = "1 pas à droite = multiplier par 10 (ou 100 pour m², 1000 pour m³).";
    topicIcon = "⚖️";
    whyItMatters = "Garantit des points précieux dans la section Mesures de l'examen régional.";
  } else if (tId.includes("symmetry") || tId.includes("symetrie") || tId.includes("reflection")) {
    bigIdea = "Tracer le symétrique parfait d'une figure sur un quadrillage.";
    realLife = "Le reflet parfait d'un papillon ou d'un arbre dans un lac calme.";
    memoryRule = "Chaque point symétrique doit être à la même distance de l'axe rouge !";
    topicIcon = "🦋";
    whyItMatters = "L'exercice de dessin géométrique le plus courant et le plus facile à valider à l'examen.";
  }

  // Check badges requirements
  const isHard = note.topic_id.includes("priority") || tId.includes("parentheses") || tId.includes("division");
  const hasPhoto = note.when_to_upload_photo && note.when_to_upload_photo !== "N/A" && note.when_to_upload_photo !== "";

  return (
    <div className="bg-white rounded-[32px] border border-paper-3 shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col mb-8 animate-fade-in max-w-2xl mx-auto">
      {/* Premium Hero Header */}
      <div className="bg-gradient-to-br from-ink to-ink-2 text-white p-6 md:p-8 flex flex-col gap-3 relative">
        {/* Background visual highlight */}
        <div className="absolute right-4 top-4 text-6xl opacity-15 pointer-events-none select-none">
          {topicIcon}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-accent text-white text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-sm">
            Coach de Révision
          </span>
          <span className="bg-white/10 text-white/90 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
            {isHard ? "🔥 Défi Moyen/Dur" : "✨ Compétence Clé"}
          </span>
          {hasPhoto && (
            <span className="bg-blue text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
              📸 Dessin requis
            </span>
          )}
        </div>
        <PedagogyMethodBadge topicId={note.topic_id} />

        <div className="flex items-center gap-3.5 mt-2">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl shadow-inner border border-white/10">
            {topicIcon}
          </div>
          <h3 className="text-xl md:text-3xl font-extrabold font-display leading-tight tracking-tight text-white">
            {note.title_for_student || note.topic_id.replace("_", " ")}
          </h3>
        </div>

        {/* Why this matters */}
        <p className="text-xs text-paper-3/90 leading-relaxed border-t border-white/10 pt-3 mt-2 font-medium">
          <span className="text-accent font-bold">Pourquoi c'est important :</span> {whyItMatters}
        </p>
      </div>

      {/* Figma-Style Segmented Tab Selectors */}
      <div className="bg-paper-2 border-b border-paper-3 p-2 flex gap-1">
        <button
          type="button"
          onClick={() => setActiveTab("concrete")}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "concrete"
              ? "bg-white text-accent shadow-sm border border-paper-3"
              : "text-ink-2 hover:bg-paper-3"
          }`}
        >
          <span>💡</span> 1. Concret
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("visual")}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "visual"
              ? "bg-white text-blue shadow-sm border border-paper-3"
              : "text-ink-2 hover:bg-paper-3"
          }`}
        >
          <span>📐</span> 2. Visuel
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("abstract")}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "abstract"
              ? "bg-white text-green shadow-sm border border-paper-3"
              : "text-ink-2 hover:bg-paper-3"
          }`}
        >
          <span>📋</span> 3. Méthode
        </button>
      </div>

      {/* Content Area */}
      <div className="p-6 md:p-8 flex flex-col gap-6 bg-white min-h-[300px]">
        {/* STEP 1: CONCRETE (Life application & big idea) */}
        {activeTab === "concrete" && (
          <div className="flex flex-col gap-5 animate-fade-in">
            {/* Big Idea box */}
            <div className="bg-accent/5 border-l-4 border-accent rounded-2xl p-5 shadow-sm">
              <span className="text-[10px] font-extrabold text-accent uppercase tracking-wider block mb-1">
                L'idée de base
              </span>
              <p className="text-base font-extrabold text-ink leading-relaxed">
                "{bigIdea}"
              </p>
            </div>

            {/* Real life example */}
            <div className="bg-paper-2 rounded-2xl p-5 border border-paper-3 flex flex-col gap-2">
              <span className="text-[10px] font-bold text-ink-2 uppercase tracking-wider">
                Exemple concret dans la vraie vie 🌍
              </span>
              <p className="text-sm text-ink font-medium leading-relaxed italic">
                "{realLife}"
              </p>
            </div>

            {/* Duolingo-style Memory Rule card */}
            <div className="bg-gold/10 border border-gold/30 rounded-2xl p-5 flex items-start gap-4 shadow-sm mt-2">
              <div className="text-2xl shrink-0">💡</div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-extrabold text-gold uppercase tracking-wider">
                  Règle d'or à retenir :
                </span>
                <p className="text-xs md:text-sm text-gold font-bold leading-relaxed">
                  {memoryRule}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: VISUAL (Large visual diagrams & photo upload specifications) */}
        {activeTab === "visual" && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <ConceptHeroVisual topicId={note.topic_id} />

            {/* Camera description if geometry construction */}
            {hasPhoto && (
              <div className="bg-blue/5 border border-blue/20 rounded-2xl p-4 flex gap-3.5 items-start mt-2">
                <span className="text-2xl shrink-0">📸</span>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-extrabold text-blue uppercase tracking-wider">
                    Recommandation de validation par photo
                  </span>
                  <p className="text-xs text-ink leading-relaxed">
                    {note.when_to_upload_photo}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: ABSTRACT (Resolution methods, traps & mini test) */}
        {activeTab === "abstract" && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* Step list */}
            <StepByStepMethod topicId={note.topic_id} defaultRules={note.all_rules_to_remember} />

            {/* Mistakes Side-by-Side */}
            <MistakeComparisonCard topicId={note.topic_id} defaultTraps={note.common_traps} />

            {/* Guided Practice question */}
            <GuidedPracticeCard
              topicId={note.topic_id}
              questionText={note.mini_practice_questions}
              answerKey={note.answer_key}
              remediationHint={note.remediation_hint}
            />
          </div>
        )}
      </div>

      {/* Methodology Source Panel at the bottom of the card */}
      <div className="px-6 pb-6 md:px-8 md:pb-8 border-t border-paper-3/30 bg-paper/5">
        <MethodologySourcePanel topicId={note.topic_id} />
      </div>
    </div>
  );
}
