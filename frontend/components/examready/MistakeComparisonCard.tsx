"use client";

import React from "react";

interface MistakeDetails {
  wrong: string;
  correct: string;
  why: string;
  trapLabel: string;
}

interface MistakeComparisonCardProps {
  topicId: string;
  defaultTraps?: string;
}

export default function MistakeComparisonCard({ topicId, defaultTraps = "" }: MistakeComparisonCardProps) {
  const tId = topicId.toLowerCase();

  let details: MistakeDetails = {
    wrong: "",
    correct: "",
    why: "",
    trapLabel: "Piège Général"
  };

  if (tId.includes("decimal_subtraction") || tId.includes("soustraction_decimale")) {
    details = {
      wrong: "47,55 - 12,45 = 35,1",
      correct: "47,55 - 12,45 = 35,10",
      why: "La valeur mathématique est identique, mais dans les examens de 6AEP, il est fortement recommandé de conserver la même précision décimale (2 chiffres après la virgule ici). De plus, aligner par la droite sans aligner la virgule donne des résultats faux.",
      trapLabel: "Oubli de Zéro de Précision ou Alignement Faux"
    };
  } else if (tId.includes("ordering_numbers") || tId.includes("ordre") || tId.includes("comparaison")) {
    details = {
      wrong: "25,4 < 25,14 (en pensant que 4 < 14) ou utiliser < au lieu de >",
      correct: "25,4 > 25,14 (car 25,40 > 25,14)",
      why: "Ne comparez pas la longueur des chiffres après la virgule directement. Ajoutez des zéros pour comparer à taille égale : 4 dixièmes valent 40 centièmes, ce qui est plus grand que 14 centièmes. Attention également à bien respecter le sens décroissant (>) ou croissant (<) demandé.",
      trapLabel: "Confondre 25,4 et 25,04"
    };
  } else if (tId.includes("angle") || tId.includes("bissectrice") || tId.includes("rapporteur")) {
    details = {
      wrong: "Lire 120° au lieu de 60° sur le rapporteur en lisant le mauvais côté de la double graduation.",
      correct: "Lire 60° car l'angle est aigu (< 90°).",
      why: "Le rapporteur a deux échelles de graduation (gauche et droite). Vérifiez toujours visuellement si votre angle est aigu (fermé, < 90°) ou obtus (ouvert, > 90°) pour ne pas choisir la mauvaise graduation.",
      trapLabel: "Erreur de Graduation sur le Rapporteur"
    };
  } else if (tId.includes("fraction") || tId.includes("partage")) {
    details = {
      wrong: "Écrire 1/3 pour représenter une part colorée sur 4 parts au total.",
      correct: "Écrire 1/4 (1 part colorée sur 4 parts égales).",
      why: "Le dénominateur (en bas) représente le nombre total de parts égales qui composent le tout, pas seulement les parts restantes non colorées.",
      trapLabel: "Compter les parts restantes au dénominateur"
    };
  } else if (tId.includes("conversion") || tId.includes("mesure") || tId.includes("unite")) {
    details = {
      wrong: "4,5 m² = 450 dm² (en pensant qu'on multiplie par 10 car m -> dm)",
      correct: "4,5 m² = 450 dm² (Ah, non! C'est correct, mais pour les m² on multiplie par 100 ! Donc 4,5 m² = 450 dm²)",
      why: "Dans les conversions d'unités de surface (m²), chaque unité comporte deux colonnes. Ainsi, 4,5 m² devient 450 dm² (et non 45 dm²). Pensez à doubler les colonnes pour les surfaces et à les tripler pour les volumes !",
      trapLabel: "Oublier le carré (²) ou cube (³) dans le tableau"
    };
  } else if (tId.includes("symmetry") || tId.includes("symetrie") || tId.includes("reflection")) {
    details = {
      wrong: "Glisser la figure vers la droite sans inverser sa direction (translation).",
      correct: "Retourner la figure comme dans un miroir (symétrie axiale).",
      why: "La symétrie axiale doit créer un effet miroir. Les points les plus proches de l'axe à gauche doivent rester les plus proches de l'axe à droite.",
      trapLabel: "Faire un simple glissement (Translation)"
    };
  } else {
    // General fallback
    if (!defaultTraps || defaultTraps === "N/A" || defaultTraps === "") {
      return null;
    }
    details = {
      wrong: "Réponse rapide sans relecture ou mauvaise méthode.",
      correct: "Prendre le temps d'appliquer les étapes clés.",
      why: defaultTraps,
      trapLabel: "Piège fréquent à l'examen"
    };
  }

  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-xs uppercase font-extrabold tracking-wider text-gold flex items-center gap-1.5 border-b border-paper-3 pb-2 mb-1">
        <span>⚠️</span> Comparaison des Pièges :
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Wrong Card */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold text-red-600 tracking-wider">
              Mauvaise méthode ❌
            </span>
            <span className="bg-red-200/50 text-red-700 text-[9px] px-2 py-0.5 rounded-full font-bold">
              Erreur classique
            </span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-red-100 font-mono text-xs md:text-sm font-bold text-red-950 min-h-[50px] flex items-center shadow-inner">
            {details.wrong}
          </div>
        </div>

        {/* Correct Card */}
        <div className="bg-green/5 border border-green/20 rounded-2xl p-5 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold text-green tracking-wider">
              Bonne méthode ✅
            </span>
            <span className="bg-green/20 text-green text-[9px] px-2 py-0.5 rounded-full font-bold">
              Recommandé examen
            </span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-green/10 font-mono text-xs md:text-sm font-bold text-green min-h-[50px] flex items-center shadow-inner">
            {details.correct}
          </div>
        </div>
      </div>

      {/* Explanation Banner */}
      <div className="bg-gold/5 border border-gold/20 rounded-2xl p-4 flex gap-3.5 items-start shadow-sm">
        <div className="bg-gold text-white font-extrabold w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm shadow-md">
          💡
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-extrabold text-gold uppercase tracking-wider">
            {details.trapLabel}
          </span>
          <p className="text-xs md:text-sm text-ink leading-relaxed font-medium">
            {details.why}
          </p>
        </div>
      </div>
    </div>
  );
}
