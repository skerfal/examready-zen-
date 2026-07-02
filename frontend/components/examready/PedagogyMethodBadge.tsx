"use client";

import React from "react";

export type BadgeType =
  | "Singapore CPA"
  | "Montessori"
  | "Mastery"
  | "Worked Example"
  | "Visual Discovery";

interface PedagogyMethodBadgeProps {
  topicId: string;
}

export function getPedagogyBadges(topicId: string): BadgeType[] {
  const tId = topicId.toLowerCase();

  if (tId.includes("decimal_subtraction") || tId.includes("soustraction_decimale")) {
    return ["Singapore CPA", "Worked Example"];
  }
  if (tId.includes("ordering_numbers") || tId.includes("ordre") || tId.includes("comparaison")) {
    return ["Singapore CPA", "Mastery"];
  }
  if (tId.includes("fraction") || tId.includes("partage")) {
    return ["Singapore CPA", "Montessori"];
  }
  if (tId.includes("conversion") || tId.includes("mesure") || tId.includes("unite")) {
    return ["Singapore CPA", "Mastery"];
  }
  if (tId.includes("angle") || tId.includes("bissectrice") || tId.includes("rapporteur")) {
    return ["Visual Discovery", "Montessori"];
  }
  if (tId.includes("triangle_construction")) {
    return ["Visual Discovery", "Montessori"];
  }
  if (tId.includes("symmetry") || tId.includes("symetrie") || tId.includes("reflection")) {
    return ["Visual Discovery", "Montessori"];
  }
  if (tId.includes("area") || tId.includes("perimeter") || tId.includes("surface") || tId.includes("perimetre")) {
    return ["Singapore CPA", "Visual Discovery"];
  }
  if (tId.includes("volume") || tId.includes("cylindre")) {
    return ["Montessori", "Worked Example"];
  }

  // Fallback
  return ["Mastery", "Worked Example"];
}

export default function PedagogyMethodBadge({ topicId }: PedagogyMethodBadgeProps) {
  const badges = getPedagogyBadges(topicId);

  const getStyleAndText = (badge: BadgeType) => {
    switch (badge) {
      case "Singapore CPA":
        return {
          label: "🇸🇬 Méthode Singapour / CPA",
          classes: "bg-green/10 text-green border-green/20"
        };
      case "Montessori":
        return {
          label: "🪵 Approche Montessori",
          classes: "bg-gold/15 text-gold border-gold/30"
        };
      case "Mastery":
        return {
          label: "📈 Maîtrise progressive",
          classes: "bg-blue/10 text-blue border-blue/20"
        };
      case "Worked Example":
        return {
          label: "✍️ Exemple guidé",
          classes: "bg-ink/5 text-ink border-paper-3"
        };
      case "Visual Discovery":
        return {
          label: "📐 Découverte visuelle",
          classes: "bg-accent/10 text-accent-dark border-accent/20"
        };
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5 mt-1.5">
      {badges.map((b) => {
        const config = getStyleAndText(b);
        return (
          <span
            key={b}
            className={`text-[9px] md:text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-0.5 rounded-md border shadow-sm transition-all ${config.classes}`}
          >
            {config.label}
          </span>
        );
      })}
    </div>
  );
}
