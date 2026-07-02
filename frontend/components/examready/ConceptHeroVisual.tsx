"use client";

import React from "react";

interface ConceptHeroVisualProps {
  topicId: string;
}

export default function ConceptHeroVisual({ topicId }: ConceptHeroVisualProps) {
  // Normalize topic ID
  const tId = topicId.toLowerCase();

  // 1. Decimal Subtraction Visual
  if (tId.includes("decimal_subtraction") || tId.includes("soustraction_decimale")) {
    return (
      <div className="w-full bg-blue/5 border border-blue/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-3">
        <span className="text-xs font-bold text-blue uppercase tracking-wider">
          Alignement des Colonnes & Virgules 📐
        </span>
        <div className="bg-white p-4 rounded-xl border border-paper-3 shadow-inner font-mono text-base md:text-lg text-ink flex flex-col gap-1 items-center">
          <div className="grid grid-cols-6 gap-2 text-center text-xs font-bold text-ink-2 border-b border-paper-3 pb-1 mb-1">
            <span>D</span>
            <span>U</span>
            <span className="text-accent">,</span>
            <span>d</span>
            <span>c</span>
            <span className="text-paper-3"></span>
          </div>
          <div className="grid grid-cols-6 gap-2 text-center w-full">
            <span>4</span>
            <span>7</span>
            <span className="text-accent font-extrabold">,</span>
            <span>5</span>
            <span>5</span>
            <span className="text-paper-3"></span>
          </div>
          <div className="grid grid-cols-6 gap-2 text-center w-full text-accent-dark">
            <span className="font-bold">-</span>
            <span>1</span>
            <span>2</span>
            <span className="text-accent font-extrabold">,</span>
            <span>4</span>
            <span>5</span>
            <span className="text-paper-3"></span>
          </div>
          <div className="w-full border-t-2 border-ink my-1"></div>
          <div className="grid grid-cols-6 gap-2 text-center w-full font-bold text-green">
            <span></span>
            <span>3</span>
            <span>5</span>
            <span className="text-accent font-extrabold">,</span>
            <span>1</span>
            <span>0</span>
            <span className="text-xs text-gold font-bold self-center">← 0 de précision</span>
          </div>
        </div>
        <p className="text-[11px] text-ink-2 text-center leading-relaxed">
          Alignez toujours les virgules (<span className="text-accent font-bold">,</span>) verticalement. Remplissez les vides avec des zéros.
        </p>
      </div>
    );
  }

  // 2. Ordering Numbers Visual
  if (tId.includes("ordering_numbers") || tId.includes("ordre") || tId.includes("comparaison")) {
    return (
      <div className="w-full bg-blue/5 border border-blue/10 rounded-2xl p-4 flex flex-col items-center gap-3">
        <span className="text-xs font-bold text-blue uppercase tracking-wider">
          Axe Gradué & Comparaison 🔢
        </span>
        {/* SVG Number Line */}
        <svg viewBox="0 0 400 90" className="w-full max-w-md bg-white rounded-xl border border-paper-3 p-2 shadow-inner">
          {/* Main Axis Line */}
          <line x1="20" y1="50" x2="380" y2="50" stroke="#1f242d" strokeWidth="2.5" markerEnd="url(#arrow)" />
          
          {/* Marks & Labels */}
          {/* 25.0 */}
          <line x1="40" y1="43" x2="40" y2="57" stroke="#1f242d" strokeWidth="2" />
          <text x="40" y="72" fontSize="9" fontWeight="bold" textAnchor="middle" fill="#1f242d">25,0</text>
          
          {/* 25.04 */}
          <circle cx="70" y="50" r="3.5" fill="#ec5c1f" />
          <line x1="70" y1="47" x2="70" y2="53" stroke="#ec5c1f" strokeWidth="1.5" />
          <text x="70" y="35" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#ec5c1f">25,04</text>
          
          {/* 25.10 */}
          <line x1="120" y1="43" x2="120" y2="57" stroke="#1f242d" strokeWidth="2" />
          <text x="120" y="72" fontSize="9" fontWeight="bold" textAnchor="middle" fill="#1f242d">25,1</text>
          
          {/* 25.14 */}
          <circle cx="150" y="50" r="3.5" fill="#ec5c1f" />
          <text x="150" y="35" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#ec5c1f">25,14</text>
          
          {/* 25.40 */}
          <line x1="300" y1="43" x2="300" y2="57" stroke="#1f242d" strokeWidth="2" />
          <text x="300" y="72" fontSize="9" fontWeight="bold" textAnchor="middle" fill="#1f242d">25,4</text>
          
          {/* 25.41 */}
          <circle cx="310" y="50" r="3.5" fill="#ec5c1f" />
          <text x="310" y="30" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#ec5c1f">25,41</text>
          
          {/* Definitions */}
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#1f242d" />
            </marker>
          </defs>
        </svg>

        <div className="flex items-center gap-1.5 flex-wrap justify-center text-xs font-extrabold bg-white px-3 py-1.5 rounded-lg border border-paper-3 shadow-sm">
          <span className="text-green">25,41</span>
          <span className="text-accent">&gt;</span>
          <span className="text-green">25,40</span>
          <span className="text-accent">&gt;</span>
          <span className="text-green">25,14</span>
          <span className="text-accent">&gt;</span>
          <span className="text-green">25,1</span>
          <span className="text-accent">&gt;</span>
          <span className="text-green">25,04</span>
        </div>
        <p className="text-[11px] text-ink-2 text-center">
          Plus un nombre est à droite sur l'axe gradué, plus il est grand !
        </p>
      </div>
    );
  }

  // 3. Fractions Visual
  if (tId.includes("fraction") || tId.includes("partage")) {
    return (
      <div className="w-full bg-blue/5 border border-blue/10 rounded-2xl p-4 flex flex-col items-center gap-4">
        <span className="text-xs font-bold text-blue uppercase tracking-wider">
          Modèles de Fractions 🍕
        </span>
        <div className="flex flex-wrap gap-6 justify-center items-center bg-white p-4 rounded-xl border border-paper-3 w-full shadow-inner">
          {/* Fraction Circle (3/4) */}
          <div className="flex flex-col items-center gap-2">
            <svg width="80" height="80" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e6e6e6" strokeWidth="2" />
              {/* Slices */}
              <path d="M 50 50 L 50 5 A 45 45 0 0 1 95 50 Z" fill="#ec5c1f" opacity="0.85" stroke="#fff" strokeWidth="2" />
              <path d="M 50 50 L 95 50 A 45 45 0 0 1 50 95 Z" fill="#ec5c1f" opacity="0.85" stroke="#fff" strokeWidth="2" />
              <path d="M 50 50 L 50 95 A 45 45 0 0 1 5 50 Z" fill="#ec5c1f" opacity="0.85" stroke="#fff" strokeWidth="2" />
              <path d="M 50 50 L 5 50 A 45 45 0 0 1 50 5 Z" fill="#f1f1f1" stroke="#fff" strokeWidth="2" />
            </svg>
            <span className="text-xs font-bold font-mono">3/4 (Trois quarts)</span>
          </div>

          {/* Fraction Bar (1/2 vs 2/4) */}
          <div className="flex flex-col gap-2 w-48">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-ink-2">Demi (1/2)</span>
              <div className="w-full h-6 border border-paper-3 rounded-lg overflow-hidden flex">
                <div className="w-1/2 bg-blue/85 border-r border-white"></div>
                <div className="w-1/2 bg-paper-2"></div>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-ink-2">Deux quarts (2/4 = 1/2)</span>
              <div className="w-full h-6 border border-paper-3 rounded-lg overflow-hidden flex">
                <div className="w-1/4 bg-blue/85 border-r border-white"></div>
                <div className="w-1/4 bg-blue/85 border-r border-white"></div>
                <div className="w-1/4 bg-paper-2 border-r border-white"></div>
                <div className="w-1/4 bg-paper-2"></div>
              </div>
            </div>
          </div>
        </div>
        <p className="text-[11px] text-ink-2 text-center">
          Le numérateur (haut) est le nombre de parts colorées. Le dénominateur (bas) est le nombre total de parts.
        </p>
      </div>
    );
  }

  // 4. Angle Construction Visual
  if (tId.includes("angle") || tId.includes("bissectrice") || tId.includes("rapporteur")) {
    return (
      <div className="w-full bg-blue/5 border border-blue/10 rounded-2xl p-4 flex flex-col items-center gap-3">
        <span className="text-xs font-bold text-blue uppercase tracking-wider">
          Tracé de l'Angle & Bissectrice 📐
        </span>
        {/* SVG Angle and Protractor */}
        <svg viewBox="0 0 200 120" className="w-full max-w-[280px] bg-white rounded-xl border border-paper-3 p-2 shadow-inner">
          {/* Protractor Arc */}
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#2c5f8d" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.5" />
          <path d="M 20 100 L 180 100 Z" fill="none" stroke="#2c5f8d" strokeWidth="1.5" opacity="0.4" />
          
          {/* Angle Arms */}
          {/* Arm 1 (Base) */}
          <line x1="100" y1="100" x2="180" y2="100" stroke="#1f242d" strokeWidth="3" />
          
          {/* Arm 2 (60 degrees) */}
          {/* cos(60) = 0.5, sin(60) = 0.866. dx = 80*0.5 = 40, dy = 80*0.866 = 69.28 */}
          <line x1="100" y1="100" x2="140" y2="31" stroke="#1f242d" strokeWidth="3" />
          
          {/* Bisector (30 degrees) */}
          {/* cos(30) = 0.866, sin(30) = 0.5. dx = 85*0.866 = 73.6, dy = 85*0.5 = 42.5 */}
          <line x1="100" y1="100" x2="173" y2="57.5" stroke="#ec5c1f" strokeWidth="1.5" strokeDasharray="4,2" />
          <text x="178" y="54" fontSize="8" fill="#ec5c1f" fontWeight="bold">Bissectrice (30°)</text>

          {/* Vertices & Markers */}
          <circle cx="100" cy="100" r="4" fill="#2c5f8d" />
          <text x="92" y="103" fontSize="9" fontWeight="bold">O</text>
          
          {/* Angle Mark */}
          <path d="M 120 100 A 20 20 0 0 0 110 83" fill="none" stroke="#2c5f8d" strokeWidth="1.5" />
          <text x="123" y="93" fontSize="8" fill="#2c5f8d" fontWeight="bold">60°</text>
        </svg>
        <p className="text-[11px] text-ink-2 text-center leading-relaxed">
          Le sommet est placé au centre du rapporteur. La bissectrice coupe l'angle en deux parties parfaitement égales.
        </p>
      </div>
    );
  }

  // 5. Unit Conversion Visual
  if (tId.includes("conversion") || tId.includes("mesure") || tId.includes("unite")) {
    return (
      <div className="w-full bg-blue/5 border border-blue/10 rounded-2xl p-4 flex flex-col items-center gap-3">
        <span className="text-xs font-bold text-blue uppercase tracking-wider">
          Échelle des Conversions Métriques ⚖️
        </span>
        {/* Staircase representation of units */}
        <div className="flex flex-col gap-2 items-center bg-white p-3 rounded-xl border border-paper-3 w-full shadow-inner font-sans text-xs">
          <div className="grid grid-cols-7 gap-1 text-center w-full font-bold text-[10px] md:text-xs">
            <span className="bg-accent/10 border border-accent/20 py-1.5 rounded text-accent">km</span>
            <span className="bg-paper-2 border border-paper-3 py-1.5 rounded">hm</span>
            <span className="bg-paper-2 border border-paper-3 py-1.5 rounded">dam</span>
            <span className="bg-blue/10 border border-blue/20 py-1.5 rounded text-blue">m</span>
            <span className="bg-paper-2 border border-paper-3 py-1.5 rounded">dm</span>
            <span className="bg-paper-2 border border-paper-3 py-1.5 rounded">cm</span>
            <span className="bg-green/10 border border-green/20 py-1.5 rounded text-green">mm</span>
          </div>

          <div className="flex items-center gap-1.5 justify-center mt-2 text-[11px] font-semibold text-ink-2 flex-wrap">
            <span>Multiplier par 10 en allant à droite ➡️</span>
            <span className="text-accent">•</span>
            <span>Diviser par 10 en allant à gauche ⬅️</span>
          </div>

          <div className="bg-paper rounded-lg p-2 border border-paper-3 text-[10px] w-full text-center mt-1 font-mono">
            Exemple : 4,5 km = 45 hm = 450 dam = 4500 m
          </div>
        </div>
        <p className="text-[11px] text-ink-2 text-center">
          Pour les surfaces (m²), chaque saut vaut <span className="font-bold text-accent">100</span> (2 chiffres par colonne). Pour les volumes (m³), chaque saut vaut <span className="font-bold text-accent">1000</span>.
        </p>
      </div>
    );
  }

  // 6. Reflection Symmetry Visual
  if (tId.includes("symmetry") || tId.includes("symetrie") || tId.includes("reflection")) {
    return (
      <div className="w-full bg-blue/5 border border-blue/10 rounded-2xl p-4 flex flex-col items-center gap-3">
        <span className="text-xs font-bold text-blue uppercase tracking-wider">
          Symétrie Axiale (Effet Miroir) 🦋
        </span>
        {/* SVG Symmetry Grid */}
        <svg viewBox="0 0 200 120" className="w-full max-w-[280px] bg-white rounded-xl border border-paper-3 p-1 shadow-inner">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e6e6e6" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="200" height="120" fill="url(#grid)" />

          {/* Mirror Axis */}
          <line x1="100" y1="0" x2="100" y2="120" stroke="#ec5c1f" strokeWidth="2" strokeDasharray="5,3" />
          <text x="104" y="15" fontSize="8" fill="#ec5c1f" fontWeight="bold">Axe Miroir (D)</text>

          {/* Original Shape (Left) */}
          <polygon points="60,30 40,80 80,80" fill="#2c5f8d" opacity="0.6" stroke="#2c5f8d" strokeWidth="1.5" />
          <circle cx="60" cy="30" r="3" fill="#2c5f8d" />
          <circle cx="40" cy="80" r="3" fill="#2c5f8d" />
          <circle cx="80" cy="80" r="3" fill="#2c5f8d" />
          <text x="32" y="85" fontSize="7" fontWeight="bold">A</text>
          
          {/* Reflected Shape (Right) */}
          {/* Reflection across x=100.
              60 -> 100 + (100 - 60) = 140
              40 -> 100 + (100 - 40) = 160
              80 -> 100 + (100 - 80) = 120
          */}
          <polygon points="140,30 160,80 120,80" fill="#2c5f8d" opacity="0.3" stroke="#2c5f8d" strokeWidth="1.5" strokeDasharray="2,2" />
          <circle cx="140" cy="30" r="3" fill="#ec5c1f" />
          <circle cx="160" cy="80" r="3" fill="#ec5c1f" />
          <circle cx="120" cy="80" r="3" fill="#ec5c1f" />
          <text x="164" y="85" fontSize="7" fontWeight="bold" fill="#ec5c1f">A'</text>

          {/* Equal distance arrow */}
          <line x1="40" y1="80" x2="100" y2="80" stroke="#1f4d3f" strokeWidth="0.8" strokeDasharray="2,2" />
          <line x1="100" y1="80" x2="160" y2="80" stroke="#1f4d3f" strokeWidth="0.8" strokeDasharray="2,2" />
          <text x="70" y="76" fontSize="6" fill="#1f4d3f" textAnchor="middle">3 car.</text>
          <text x="130" y="76" fontSize="6" fill="#1f4d3f" textAnchor="middle">3 car.</text>
        </svg>
        <p className="text-[11px] text-ink-2 text-center leading-relaxed">
          Chaque point de l'image est à la <span className="font-bold text-accent">même distance</span> de l'axe rouge que le point d'origine.
        </p>
      </div>
    );
  }

  // 7. Area & Perimeter Visual
  if (tId.includes("area") || tId.includes("perimeter") || tId.includes("surface") || tId.includes("perimetre")) {
    return (
      <div className="w-full bg-blue/5 border border-blue/10 rounded-2xl p-4 flex flex-col items-center gap-3">
        <span className="text-xs font-bold text-blue uppercase tracking-wider">
          Périmètre (Contour) vs Aire (Surface) 📐
        </span>
        <div className="flex flex-wrap gap-4 justify-center items-center bg-white p-4 rounded-xl border border-paper-3 w-full shadow-inner">
          <svg viewBox="0 0 160 100" className="w-32 bg-paper-2 rounded border border-paper-3">
            {/* Grid 4x3 */}
            <defs>
              <pattern id="smallgrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <rect width="20" height="20" fill="none" stroke="#e6e6e6" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="160" height="100" fill="url(#smallgrid)" />

            {/* Shape 4x3 units starting at (40, 20) to (120, 80) */}
            <rect x="40" y="20" width="80" height="60" fill="#2c5f8d" fillOpacity="0.2" stroke="#2c5f8d" strokeWidth="2.5" />
            <text x="80" y="55" fontSize="10" fontWeight="bold" fill="#2c5f8d" textAnchor="middle">Aire</text>
            <text x="80" y="15" fontSize="8" fontWeight="bold" textAnchor="middle">Longeur = 4 cm</text>
            <text x="25" y="55" fontSize="8" fontWeight="bold" textAnchor="middle" transform="rotate(-90, 25, 55)">Largeur = 3 cm</text>
          </svg>
          <div className="flex flex-col gap-2 text-xs font-semibold">
            <div className="bg-blue/10 border border-blue/20 rounded p-2 text-blue">
              <span className="font-bold">Périmètre (Contour) :</span>
              <p className="font-mono mt-0.5">(4 + 3) × 2 = 14 cm</p>
            </div>
            <div className="bg-accent/10 border border-accent/20 rounded p-2 text-accent-dark">
              <span className="font-bold">Aire (Surface) :</span>
              <p className="font-mono mt-0.5">4 × 3 = 12 cm²</p>
            </div>
          </div>
        </div>
        <p className="text-[11px] text-ink-2 text-center leading-relaxed">
          Le périmètre entoure la forme. L'aire compte le nombre de carrés de 1 cm² à l'intérieur.
        </p>
      </div>
    );
  }

  // 8. Volume Visual
  if (tId.includes("volume") || tId.includes("cylindre") || tId.includes("prisme")) {
    return (
      <div className="w-full bg-blue/5 border border-blue/10 rounded-2xl p-4 flex flex-col items-center gap-3">
        <span className="text-xs font-bold text-blue uppercase tracking-wider">
          Volume (Espace en 3D) 🧊
        </span>
        <div className="flex flex-wrap gap-4 justify-center items-center bg-white p-4 rounded-xl border border-paper-3 w-full shadow-inner">
          {/* Stacked 3D cubes representation */}
          <svg viewBox="0 0 120 100" className="w-24">
            {/* Draw 3D cubes stacked */}
            {/* Cube 1 (Back left) */}
            <path d="M 20,60 L 40,50 L 60,60 L 40,70 Z" fill="#2c5f8d" stroke="#fff" opacity="0.8" />
            <path d="M 20,60 L 20,80 L 40,90 L 40,70 Z" fill="#1f4d3f" stroke="#fff" opacity="0.8" />
            <path d="M 40,70 L 40,90 L 60,80 L 60,60 Z" fill="#ec5c1f" stroke="#fff" opacity="0.8" />
            
            {/* Cube 2 (Front right) */}
            <path d="M 50,70 L 70,60 L 90,70 L 70,80 Z" fill="#2c5f8d" stroke="#fff" />
            <path d="M 50,70 L 50,90 L 70,100 L 70,80 Z" fill="#1f4d3f" stroke="#fff" />
            <path d="M 70,80 L 70,100 L 90,90 L 90,70 Z" fill="#ec5c1f" stroke="#fff" />

            {/* Cube 3 (On top of 1) */}
            <path d="M 20,40 L 40,30 L 60,40 L 40,50 Z" fill="#2c5f8d" stroke="#fff" opacity="0.9" />
            <path d="M 20,40 L 20,60 L 40,70 L 40,50 Z" fill="#1f4d3f" stroke="#fff" opacity="0.9" />
            <path d="M 40,50 L 40,70 L 60,60 L 60,40 Z" fill="#ec5c1f" stroke="#fff" opacity="0.9" />
          </svg>
          <div className="flex flex-col gap-1.5 text-xs text-ink">
            <span className="font-bold">Formule générale :</span>
            <p className="bg-paper p-1.5 rounded border border-paper-3 font-mono">
              Volume = Aire de base × Hauteur
            </p>
            <p className="text-[10px] text-ink-2 leading-relaxed">
              Unité : mètres cubes (<span className="font-bold">m³</span>) ou litres (<span className="font-bold">L</span>).
            </p>
          </div>
        </div>
        <p className="text-[11px] text-ink-2 text-center">
          Le volume mesure la quantité de petits cubes nécessaires pour remplir tout l'espace intérieur de l'objet.
        </p>
      </div>
    );
  }

  // Fallback visual for default math topics
  return (
    <div className="w-full bg-blue/5 border border-blue/10 rounded-2xl p-4 flex flex-col items-center gap-3">
      <span className="text-xs font-bold text-blue uppercase tracking-wider">
        Modèle Mathématique 🧠
      </span>
      <div className="bg-white p-4 rounded-xl border border-paper-3 w-full text-center shadow-inner font-semibold text-sm text-ink-2 italic">
        "Visualisez le calcul au brouillon avant d'écrire la réponse finale."
      </div>
      <p className="text-[11px] text-ink-2 text-center leading-relaxed">
        Résolvez la question étape par étape pour éviter les erreurs de calcul élémentaire.
      </p>
    </div>
  );
}
