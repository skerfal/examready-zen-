"use client";

import React from "react";

interface VisualSupportCardProps {
  topicId: string;
  visualDescription: string;
  whenToUploadPhoto?: string;
}

export default function VisualSupportCard({
  topicId,
  visualDescription,
  whenToUploadPhoto
}: VisualSupportCardProps) {
  const hasPhotoInstructions =
    whenToUploadPhoto &&
    whenToUploadPhoto !== "N/A" &&
    whenToUploadPhoto !== "";

  // Render SVG based on topicId
  const renderVisualDiagram = () => {
    switch (topicId) {
      case "angle_construction":
        return (
          <div className="flex flex-col items-center gap-3">
            <svg width="220" height="150" viewBox="0 0 220 150" className="bg-white border border-paper-3 rounded-xl shadow-inner">
              {/* Angle drawing */}
              <line x1="110" y1="120" x2="190" y2="120" stroke="#1f242d" strokeWidth="2.5" />
              <line x1="110" y1="120" x2="82.6" y2="44.8" stroke="#1f242d" strokeWidth="2.5" />
              {/* Bisector */}
              <line x1="110" y1="120" x2="136" y2="65" stroke="#ec5c1f" strokeWidth="2" strokeDasharray="4 3" />
              {/* Compas Arcs */}
              <path d="M 150 120 A 40 40 0 0 0 139.7 92.6" fill="none" stroke="#2c5f8d" strokeWidth="1.5" />
              <path d="M 96.3 82.4 A 40 40 0 0 0 96.3 82.4" fill="none" stroke="#2c5f8d" strokeWidth="1.5" />
              {/* Center point */}
              <circle cx="110" cy="120" r="3" fill="#1f242d" />
              <text x="105" y="135" className="text-[10px] font-sans font-bold fill-ink">O</text>
              <text x="195" y="125" className="text-[10px] font-sans font-bold fill-ink">B</text>
              <text x="70" y="45" className="text-[10px] font-sans font-bold fill-ink">A</text>
              <text x="135" y="55" className="text-[10px] font-sans font-bold fill-accent">I</text>
              
              {/* Angle arc label */}
              <path d="M 130 120 A 20 20 0 0 0 119.7 101.2" fill="none" stroke="#d97a2c" strokeWidth="1.5" />
              <text x="135" y="112" className="text-[9px] font-sans font-bold fill-gold">110°</text>
              <text x="110" y="108" className="text-[8px] font-sans fill-accent">55°</text>
            </svg>
            <p className="text-[11px] text-ink-2 text-center max-w-xs leading-normal">
              Tracé de l'angle obtus <strong>AÔB (110°)</strong> et sa bissectrice <strong>[OI)</strong> coupant l'angle en deux secteurs de 55°.
            </p>
          </div>
        );

      case "triangle_construction":
        return (
          <div className="flex flex-col items-center gap-3">
            <svg width="220" height="150" viewBox="0 0 220 150" className="bg-white border border-paper-3 rounded-xl shadow-inner">
              {/* Right angle triangle */}
              <polygon points="50,110 170,110 50,20" fill="none" stroke="#1f242d" strokeWidth="2.5" />
              {/* Right angle square indicator */}
              <rect x="50" y="100" width="10" height="10" fill="none" stroke="#ec5c1f" strokeWidth="1.5" />
              
              <circle cx="50" cy="110" r="3" fill="#1f242d" />
              <circle cx="170" cy="110" r="3" fill="#1f242d" />
              <circle cx="50" cy="20" r="3" fill="#1f242d" />
              
              <text x="40" y="122" className="text-[10px] font-sans font-bold fill-ink">A (90°)</text>
              <text x="175" y="115" className="text-[10px] font-sans font-bold fill-ink">B</text>
              <text x="45" y="15" className="text-[10px] font-sans font-bold fill-ink">C</text>
              
              {/* Dimensions labels */}
              <text x="110" y="122" className="text-[9px] font-sans font-bold fill-blue">AB = 4 cm</text>
              <text x="15" y="70" className="text-[9px] font-sans font-bold fill-blue">AC = 3 cm</text>
            </svg>
            <p className="text-[11px] text-ink-2 text-center max-w-xs leading-normal">
              Triangle rectangle en <strong>A</strong>. Le côté <strong>AB (4 cm)</strong> est perpendiculaire à <strong>AC (3 cm)</strong>.
            </p>
          </div>
        );

      case "reflection_symmetry":
        return (
          <div className="flex flex-col items-center gap-3">
            <svg width="220" height="150" viewBox="0 0 220 150" className="bg-white border border-paper-3 rounded-xl shadow-inner">
              {/* Grid background */}
              <path d="M 0,30 L 220,30 M 0,60 L 220,60 M 0,90 L 220,90 M 0,120 L 220,120 M 36,0 L 36,150 M 72,0 L 72,150 M 148,0 L 148,150 M 184,0 L 184,150" stroke="#f1f1f1" strokeWidth="1" />
              {/* Symmetry Axis */}
              <line x1="110" y1="0" x2="110" y2="150" stroke="#ec5c1f" strokeWidth="2" strokeDasharray="3 3" />
              <text x="115" y="15" className="text-[8px] font-sans font-bold fill-accent">(L) Axe de symétrie</text>
              
              {/* Left Shape */}
              <polygon points="72,40 90,60 72,90 54,60" fill="#2c5f8d" fillOpacity="0.2" stroke="#2c5f8d" strokeWidth="2" />
              {/* Right Shape (Reflected) */}
              <polygon points="148,40 130,60 148,90 166,60" fill="#1f4d3f" fillOpacity="0.2" stroke="#1f4d3f" strokeWidth="2" />
              
              {/* Distances indicators */}
              <line x1="72" y1="40" x2="110" y2="40" stroke="#d97a2c" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="110" y1="40" x2="148" y2="40" stroke="#d97a2c" strokeWidth="1" strokeDasharray="2 2" />
              <text x="85" y="36" className="text-[8px] fill-gold font-mono">1 cm</text>
              <text x="120" y="36" className="text-[8px] fill-gold font-mono">1 cm</text>
            </svg>
            <p className="text-[11px] text-ink-2 text-center max-w-xs leading-normal">
              Chaque sommet de la figure verte est situé à la même distance de l'axe vertical <strong>(L)</strong> que son homologue bleu.
            </p>
          </div>
        );

      case "enlargement_scale":
        return (
          <div className="flex flex-col items-center gap-3">
            <svg width="220" height="150" viewBox="0 0 220 150" className="bg-white border border-paper-3 rounded-xl shadow-inner">
              {/* Small shape (F1) */}
              <rect x="25" y="45" width="30" height="60" fill="#2c5f8d" fillOpacity="0.2" stroke="#2c5f8d" strokeWidth="2" />
              <text x="32" y="78" className="text-[10px] font-sans font-bold fill-blue">F1</text>
              
              {/* Arrow */}
              <path d="M 75,75 L 115,75" fill="none" stroke="#d97a2c" strokeWidth="2" markerEnd="url(#arrow)" />
              <text x="82" y="68" className="text-[8px] font-sans font-bold fill-gold">x2 (facteur 2)</text>
              
              {/* Large shape (F2) */}
              <rect x="135" y="15" width="60" height="120" fill="#1f4d3f" fillOpacity="0.2" stroke="#1f4d3f" strokeWidth="2" />
              <text x="157" y="78" className="text-[10px] font-sans font-bold fill-green">F2</text>
              
              {/* Arrow head definition */}
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#d97a2c" />
                </marker>
              </defs>
            </svg>
            <p className="text-[11px] text-ink-2 text-center max-w-xs leading-normal">
              Agrandissement de facteur 2 : la largeur double de 30 à 60, et la hauteur double de 60 à 120.
            </p>
          </div>
        );

      default:
        // Default math grid worksheet
        return (
          <div 
            className="w-full h-24 border border-dashed border-paper-3 rounded-xl flex items-center justify-center relative overflow-hidden"
            style={{
              backgroundImage: "linear-gradient(rgba(0,0,0,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.03) 1px, transparent 1px)",
              backgroundSize: "15px 15px"
            }}
          >
            <span className="text-xl">📊</span>
            <span className="text-[11px] text-ink-2 font-mono font-medium ml-2 uppercase tracking-wide">
              Schéma explicatif
            </span>
          </div>
        );
    }
  };

  return (
    <div className="bg-white border border-paper-3 rounded-2xl p-5 flex flex-col gap-4">
      <h5 className="text-xs uppercase font-bold tracking-wider text-ink flex items-center gap-1.5 border-b border-paper-3 pb-2.5">
        <span>📐</span> Illustration Visuelle & Guide de Tracé
      </h5>
      
      {/* Dynamic Diagram */}
      <div className="flex justify-center p-2 bg-paper rounded-xl">
        {renderVisualDiagram()}
      </div>

      {/* Description text */}
      {visualDescription && visualDescription !== "N/A" && (
        <div className="bg-paper-2 rounded-xl p-3.5 border-l-4 border-blue">
          <p className="text-ink text-xs md:text-sm leading-relaxed">
            {visualDescription}
          </p>
        </div>
      )}

      {/* Camera / Photo snapshot badge if applicable */}
      {hasPhotoInstructions && (
        <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 flex gap-3 items-start mt-1">
          <span className="text-xl">📸</span>
          <div className="flex flex-col gap-0.5">
            <h6 className="text-xs font-bold text-accent uppercase tracking-wider">
              Envoi de Photo Recommandé
            </h6>
            <p className="text-ink text-xs leading-normal font-medium">
              {whenToUploadPhoto}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
