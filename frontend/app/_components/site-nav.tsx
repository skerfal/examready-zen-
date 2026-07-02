"use client";

import { useEffect, useState } from "react";

const links = [
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#niveaux", label: "Niveaux" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
];

const PLATFORM_URL = "/iqraanow-platform_4.html";

function Brandmark() {
  return (
    <svg viewBox="0 0 32 32" className="h-9 w-9" aria-hidden="true">
      <defs>
        <linearGradient id="navlogo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff7a3d" />
          <stop offset="55%" stopColor="#ec5c1f" />
          <stop offset="100%" stopColor="#c64715" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#navlogo)" />
      <line x1="4" y1="16" x2="28" y2="16" stroke="white" strokeWidth="0.9" opacity="0.32" />
      <ellipse cx="16" cy="16" rx="12" ry="5" stroke="white" strokeWidth="0.9" opacity="0.2" fill="none" />
      <path d="M 6 12.5 Q 11 11 16 13.5 L 16 22.5 Q 11 21 6 22 Z" fill="white" opacity="0.96" />
      <path d="M 26 12.5 Q 21 11 16 13.5 L 16 22.5 Q 21 21 26 22 Z" fill="white" opacity="0.96" />
      <line x1="16" y1="13.5" x2="16" y2="22.5" stroke="#fde6c9" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-2xl border px-4 py-2.5 transition-colors duration-300 sm:px-6 ${
          scrolled
            ? "border-ink/10 bg-paper/85 shadow-[0_8px_32px_-12px_rgba(20,24,31,0.18)] backdrop-blur-md"
            : "border-transparent bg-transparent"
        }`}
      >
        <a href="#top" className="flex items-center gap-2.5 cursor-pointer">
          <Brandmark />
          <span className="font-display text-lg font-semibold tracking-tight text-ink">
            IqraaNow
          </span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm font-medium text-ink/70 transition-colors duration-200 hover:text-ink cursor-pointer"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href={PLATFORM_URL}
            className="text-sm font-medium text-ink/70 transition-colors duration-200 hover:text-ink cursor-pointer"
          >
            Se connecter
          </a>
          <a
            href={PLATFORM_URL}
            className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper transition-colors duration-200 hover:bg-ink-2 cursor-pointer"
          >
            Accéder à la plateforme
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-ink transition-colors duration-200 hover:bg-ink/5 md:hidden cursor-pointer"
        >
          {open ? (
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </nav>

      {open && (
        <div className="mx-auto mt-2 max-w-6xl rounded-2xl border border-ink/10 bg-paper/95 p-4 shadow-[0_8px_32px_-12px_rgba(20,24,31,0.18)] backdrop-blur-md md:hidden">
          <ul className="flex flex-col">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-3 text-base font-medium text-ink/80 transition-colors duration-200 hover:bg-ink/5 hover:text-ink cursor-pointer"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-col gap-2 border-t border-ink/10 pt-3">
            <a
              href={PLATFORM_URL}
              className="rounded-full border border-ink/15 px-4 py-2.5 text-center text-sm font-semibold text-ink transition-colors duration-200 hover:bg-ink/5 cursor-pointer"
            >
              Se connecter
            </a>
            <a
              href={PLATFORM_URL}
              className="rounded-full bg-accent px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-dark cursor-pointer"
            >
              Accéder à la plateforme
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
