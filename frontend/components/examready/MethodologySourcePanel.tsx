"use client";

import React, { useState } from "react";

interface MethodologySourcePanelProps {
  topicId: string;
}

export default function MethodologySourcePanel({ topicId }: MethodologySourcePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tId = topicId.toLowerCase();

  let explanation = "Cette méthode permet d'apprendre pas à pas grâce à un exemple pas-à-pas résolu et des exercices d'entraînement progressifs.";
  let title = "Méthodologie Active";

  if (tId.includes("decimal_subtraction") || tId.includes("soustraction_decimale")) {
    title = "CPA + Modélisation Guidée";
    explanation = "On part d'une situation concrète (CPA), puis on montre les nombres dans un tableau de valeurs (Pictorial), avant de passer au calcul écrit posé (Abstract).";
  } else if (tId.includes("ordering_numbers") || tId.includes("ordre") || tId.includes("comparaison")) {
    title = "CPA + Axe Gradué";
    explanation = "L'élève visualise d'abord les valeurs sur un axe gradué (modèle pictorial) pour comprendre leur position relative, puis applique des étapes logiques de comparaison.";
  } else if (tId.includes("fraction") || tId.includes("partage")) {
    title = "Singapour CPA + Manipulation Montessori";
    explanation = "Les fractions sont plus faciles à comprendre avec des parts visibles et manipulables (comme les camemberts) avant d'utiliser les symboles abstraits.";
  } else if (tId.includes("conversion") || tId.includes("mesure") || tId.includes("unite")) {
    title = "Maîtrise Progressive & Tableaux Visuels";
    explanation = "L'utilisation du tableau de conversion structure la pensée spatiale (Pictorial) de l'élève avant de faire des opérations de décalage de virgule.";
  } else if (tId.includes("angle") || tId.includes("bissectrice") || tId.includes("rapporteur")) {
    title = "Découverte Visuelle + Outils Montessori";
    explanation = "L'élève observe d'abord le tracé géométrique et le fonctionnement du rapporteur (Pictorial), puis applique la règle de division pour la bissectrice.";
  } else if (tId.includes("triangle_construction")) {
    title = "Tracé Actif & Outils de Report";
    explanation = "Tracer un triangle nécessite de comprendre le rôle de la règle et du compas comme des outils de report de distance physique avant le tracé abstrait.";
  } else if (tId.includes("symmetry") || tId.includes("symetrie") || tId.includes("reflection")) {
    title = "Découverte Visuelle + Effet Miroir";
    explanation = "L'axe de symétrie agit comme un miroir physique (effet papillon). Compter les carreaux permet de manipuler la distance avant de tracer.";
  } else if (tId.includes("area") || tId.includes("perimeter") || tId.includes("surface") || tId.includes("perimetre")) {
    title = "CPA + Grille Carrée";
    explanation = "Distinguer le contour (périmètre) de la surface intérieure (aire) se fait en visualisant des petits carrés unitaires de 1 cm².";
  } else if (tId.includes("volume") || tId.includes("cylindre")) {
    title = "Blocs de Cubes Montessori";
    explanation = "La notion de volume en 3D est introduite par l'assemblage de cubes physiques en bois, suivi par l'application de la formule de base.";
  }

  return (
    <div className="border border-paper-3 rounded-2xl overflow-hidden mt-6 bg-paper/20">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3 text-left font-bold text-xs uppercase text-ink-2 hover:bg-paper-2 flex justify-between items-center transition-colors cursor-pointer"
      >
        <span>💡 Pourquoi cette méthode ? ({title})</span>
        <span className="text-base text-accent font-extrabold">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="px-5 py-4 border-t border-paper-3 bg-white text-xs leading-relaxed text-ink-2 animate-fade-in flex flex-col gap-2">
          <p className="font-semibold text-ink">
            {explanation}
          </p>
          <p className="text-[10px] text-ink-2 italic border-t border-paper-3/50 pt-2 mt-1">
            Inspiré des meilleures pratiques de la Méthode de Singapour, de la pédagogie Montessori et de l'enseignement structuré pour les examens 6AEP.
          </p>
        </div>
      )}
    </div>
  );
}
