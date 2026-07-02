import React from "react";

export interface SubjectBadgeProps {
  subject: string;
}

export default function SubjectBadge({ subject }: SubjectBadgeProps) {
  let bgClass = "bg-paper-3 text-ink/80 border-ink/10";
  if (subject === "Mathématiques") {
    bgClass = "bg-blue/10 text-blue border-blue/20";
  } else if (subject === "Français") {
    bgClass = "bg-accent/10 text-accent border-accent/20";
  } else if (subject === "Langue Arabe" || subject === "Arabic" || subject === "العربية") {
    bgClass = "bg-gold/10 text-gold border-gold/20";
  } else if (subject === "Éducation Islamique" || subject === "التربية الإسلامية") {
    bgClass = "bg-green/10 text-green border-green/20";
  }

  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${bgClass}`}>
      {subject}
    </span>
  );
}
