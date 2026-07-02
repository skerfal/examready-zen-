"use client";

import React from "react";

interface Step {
  num: number;
  title: string;
  instruction: string;
  expression?: string;
  badge?: string;
}

interface StepByStepMethodProps {
  topicId: string;
  defaultRules?: string;
}

export default function StepByStepMethod({ topicId, defaultRules = "" }: StepByStepMethodProps) {
  const tId = topicId.toLowerCase();

  let steps: Step[] = [];

  if (tId.includes("decimal_subtraction") || tId.includes("soustraction_decimale")) {
    steps = [
      {
        num: 1,
        title: "Aligner les virgules",
        instruction: "Placez les nombres l'un sous l'autre en alignant parfaitement les virgules.",
        expression: "12,45 sous 47,55",
        badge: ","
      },
      {
        num: 2,
        title: "Ajouter des zéros de précision",
        instruction: "Si un nombre a moins de chiffres après la virgule, ajoutez des zéros à droite.",
        expression: "47,5 - 12,45 → 47,50 - 12,45",
        badge: "0"
      },
      {
        num: 3,
        title: "Soustraire par colonnes",
        instruction: "Soustrayez de droite à gauche, en faisant des emprunts si nécessaire.",
        expression: "10 - 5 = 5, etc.",
        badge: "-"
      },
      {
        num: 4,
        title: "Placer la virgule au résultat",
        instruction: "Descendez la virgule directement dans le résultat, sous les autres virgules.",
        expression: "Reste: 35,10",
        badge: ","
      }
    ];
  } else if (tId.includes("ordering_numbers") || tId.includes("ordre") || tId.includes("comparaison")) {
    steps = [
      {
        num: 1,
        title: "Convertir en écriture décimale",
        instruction: "Transformez les fractions et les entiers en nombres à virgule.",
        expression: "251/10 = 25,1",
        badge: "10"
      },
      {
        num: 2,
        title: "Égaliser les chiffres décimaux",
        instruction: "Ajoutez des zéros invisibles pour que tous les nombres aient la même longueur après la virgule.",
        expression: "25,4 → 25,40 ; 25 → 25,00",
        badge: "0"
      },
      {
        num: 3,
        title: "Comparer la partie entière",
        instruction: "Regardez le nombre avant la virgule. Plus il est grand, plus le nombre est grand.",
        expression: "25 > 24",
        badge: "Int"
      },
      {
        num: 4,
        title: "Comparer la partie décimale",
        instruction: "Si la partie entière est identique, comparez chiffre par chiffre de gauche à droite (dixièmes, puis centièmes).",
        expression: "25,41 > 25,40 (car 1 > 0)",
        badge: ">"
      }
    ];
  } else if (tId.includes("angle") || tId.includes("bissectrice") || tId.includes("rapporteur")) {
    steps = [
      {
        num: 1,
        title: "Tracer le premier côté",
        instruction: "Tracez un segment horizontal avec la règle et placez le sommet O à l'extrémité.",
        expression: "[OA)",
        badge: "📏"
      },
      {
        num: 2,
        title: "Placer le centre du rapporteur",
        instruction: "Posez le centre du rapporteur sur le sommet O, et alignez la ligne du 0° avec le segment.",
        expression: "Sommet = Centre ; Ligne = 0°",
        badge: "🎯"
      },
      {
        num: 3,
        title: "Marquer la mesure de l'angle",
        instruction: "Trouvez la graduation demandée (ex: 60°) sur l'échelle et faites un petit point au crayon.",
        expression: "Exemple: 60°",
        badge: "°"
      },
      {
        num: 4,
        title: "Relier et tracer la bissectrice",
        instruction: "Tracez le deuxième côté. Pour la bissectrice, mesurez la moitié de l'angle (ex: 30°) et tracez la ligne médiane.",
        expression: "60° ÷ 2 = 30°",
        badge: "📐"
      }
    ];
  } else if (tId.includes("fraction") || tId.includes("partage")) {
    steps = [
      {
        num: 1,
        title: "Identifier les parts",
        instruction: "Comptez le nombre total de parts égales (dénominateur, en bas).",
        expression: "Ex: 4 parts au total",
        badge: "b"
      },
      {
        num: 2,
        title: "Compter les parts sélectionnées",
        instruction: "Comptez le nombre de parts colorées ou demandées (numérateur, en haut).",
        expression: "Ex: 3 parts colorées",
        badge: "h"
      },
      {
        num: 3,
        title: "Simplifier si nécessaire",
        instruction: "Divisez le haut et le bas par le même diviseur commun pour obtenir une fraction plus petite.",
        expression: "2/4 = 1/2 (divisé par 2)",
        badge: "÷"
      }
    ];
  } else if (tId.includes("conversion") || tId.includes("mesure") || tId.includes("unite")) {
    steps = [
      {
        num: 1,
        title: "Dessiner le tableau de conversion",
        instruction: "Écrivez les colonnes des unités (km, hm, dam, m, dm, cm, mm).",
        expression: "k - h - da - (unité) - d - c - m",
        badge: "📋"
      },
      {
        num: 2,
        title: "Placer le chiffre des unités",
        instruction: "Placez le chiffre juste avant la virgule dans la colonne de l'unité de départ.",
        expression: "Dans 4,5 km: placez 4 dans 'km'",
        badge: "U"
      },
      {
        num: 3,
        title: "Déplacer la virgule ou ajouter des zéros",
        instruction: "Déplacez la virgule vers la colonne cible, ou ajoutez des zéros jusqu'à la colonne demandée.",
        expression: "Cible m: déplacez vers 'm' → 4500 m",
        badge: "➡️"
      }
    ];
  } else if (tId.includes("symmetry") || tId.includes("symetrie") || tId.includes("reflection")) {
    steps = [
      {
        num: 1,
        title: "Repérer les sommets",
        instruction: "Identifiez les coins (sommets) importants de la figure d'origine.",
        expression: "Points A, B, C",
        badge: "•"
      },
      {
        num: 2,
        title: "Compter les carreaux",
        instruction: "Pour chaque sommet, comptez le nombre de carreaux qui le séparent de l'axe de symétrie.",
        expression: "Exemple: A est à 3 carreaux de l'axe",
        badge: "🔢"
      },
      {
        num: 3,
        title: "Reporter la même distance",
        instruction: "Comptez le même nombre de carreaux de l'autre côté de l'axe et dessinez le point symétrique.",
        expression: "A' à 3 carreaux à droite",
        badge: "🦋"
      },
      {
        num: 4,
        title: "Relier les nouveaux points",
        instruction: "Utilisez la règle pour relier les nouveaux points obtenus. La figure doit être le reflet miroir.",
        expression: "Reliez A', B', C'",
        badge: "📏"
      }
    ];
  } else {
    // General fallback
    const ruleLines = defaultRules
      .split("\n")
      .map(line => line.replace(/^\d+[\.\-\s]*/, "").trim())
      .filter(line => line !== "");

    if (ruleLines.length > 0) {
      steps = ruleLines.map((line, idx) => ({
        num: idx + 1,
        title: `Étape ${idx + 1}`,
        instruction: line,
        badge: "📋"
      }));
    } else {
      steps = [
        {
          num: 1,
          title: "Analyser",
          instruction: "Lisez attentivement l'énoncé et repérez l'unité demandée.",
          badge: "📖"
        },
        {
          num: 2,
          title: "Calculer",
          instruction: "Posez le calcul de base au brouillon sans vous précipiter.",
          badge: "➕"
        },
        {
          num: 3,
          title: "Vérifier",
          instruction: "Relisez votre calcul et assurez-vous que la réponse est logique.",
          badge: "✅"
        }
      ];
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-xs uppercase font-extrabold tracking-wider text-green flex items-center gap-1.5 border-b border-paper-3 pb-2 mb-1">
        <span>📋</span> Méthode pas à pas :
      </h4>
      
      <div className="flex flex-col gap-3">
        {steps.map((step) => (
          <div
            key={step.num}
            className="flex gap-4 items-start bg-white p-4 rounded-2xl border border-paper-3 shadow-sm hover:shadow transition-all"
          >
            {/* Big number circle */}
            <div className="bg-green text-white font-extrabold w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md text-sm">
              {step.num}
            </div>

            {/* Instruction content */}
            <div className="flex-1 flex flex-col gap-1">
              <h5 className="text-sm font-bold text-ink flex items-center gap-2">
                {step.title}
                {step.badge && (
                  <span className="bg-paper-3 text-ink-2 text-[9px] px-2 py-0.5 rounded-full font-mono font-extrabold">
                    {step.badge}
                  </span>
                )}
              </h5>
              <p className="text-xs md:text-sm text-ink-2 leading-relaxed">
                {step.instruction}
              </p>
              {step.expression && (
                <span className="text-[11px] font-bold font-mono bg-paper p-1.5 rounded border border-paper-3 text-ink-2 mt-1 self-start">
                  {step.expression}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
