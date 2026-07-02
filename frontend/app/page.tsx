import SiteNav from "./_components/site-nav";
import Faq from "./_components/faq";

const PLATFORM_URL = "/iqraanow-platform_4.html";

/* ---------- Icons (Lucide-style, 24x24) ---------- */
type IconProps = { className?: string };

const Icon = ({ className = "h-6 w-6", d }: IconProps & { d: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d={d} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BookIcon = (p: IconProps) => (
  <Icon {...p} d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15Z" />
);
const TargetIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={p.className ?? "h-6 w-6"} aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.75" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
);
const ChartIcon = (p: IconProps) => (
  <Icon {...p} d="M3 3v18h18M8 16v-5M13 16V8M18 16v-9" />
);
const SchoolIcon = (p: IconProps) => (
  <Icon {...p} d="M12 4 2 9l10 5 10-5-10-5ZM6 11.5V17c0 1 2.7 3 6 3s6-2 6-3v-5.5" />
);
const SparkIcon = (p: IconProps) => (
  <Icon {...p} d="M12 3l1.6 4.8L18.4 9 13.6 10.6 12 15.4 10.4 10.6 5.6 9l4.8-1.2L12 3ZM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z" />
);
const GlobeIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={p.className ?? "h-6 w-6"} aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
    <path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);
const FlagIcon = (p: IconProps) => (
  <Icon {...p} d="M5 21V4M5 4c2.5-1.5 5 1.5 7.5 0S17.5 2.5 20 4v9c-2.5 1.5-5-1.5-7.5 0S7.5 14.5 5 13" />
);
const CheckIcon = (p: IconProps) => (
  <Icon {...(p as IconProps)} className={p.className ?? "h-5 w-5"} d="M20 6 9 17l-5-5" />
);
const ArrowIcon = (p: IconProps) => (
  <Icon {...(p as IconProps)} className={p.className ?? "h-5 w-5"} d="M5 12h14M13 6l6 6-6 6" />
);
const QuoteIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={p.className ?? "h-7 w-7"} aria-hidden="true">
    <path d="M9.5 6C6.5 7.3 5 9.8 5 13.5V18h5v-5H7.6c.2-2 1.2-3.3 2.9-4L9.5 6Zm9 0c-3 1.3-4.5 3.8-4.5 7.5V18h5v-5h-2.4c.2-2 1.2-3.3 2.9-4L18.5 6Z" />
  </svg>
);

/* ---------- Data ---------- */
const features = [
  {
    icon: BookIcon,
    title: "Comprendre la leçon",
    body: "Des cours clairs, structurés et progressifs qui vont à l'essentiel — pour vraiment saisir le fond, pas seulement réciter.",
  },
  {
    icon: TargetIcon,
    title: "Maîtriser l'examen",
    body: "Des exercices ciblés et des annales corrigées qui reproduisent les épreuves réelles pour arriver le jour J en confiance.",
  },
  {
    icon: ChartIcon,
    title: "Suivre ses progrès",
    body: "Un suivi de progression et d'XP qui montre exactement ce qui est acquis et ce qui reste à consolider.",
  },
  {
    icon: SchoolIcon,
    title: "Multi-écoles",
    body: "Chaque établissement garde son identité et ses programmes, avec la même expérience d'apprentissage de qualité.",
  },
  {
    icon: GlobeIcon,
    title: "Bilingue FR / AR",
    body: "Une plateforme pensée en français et en arabe, avec une lecture confortable et adaptée dans les deux langues.",
  },
  {
    icon: SparkIcon,
    title: "Apprentissage motivant",
    body: "Objectifs, célébrations et rythme adapté : la régularité devient une habitude, et le progrès une récompense.",
  },
];

const niveaux = [
  {
    icon: FlagIcon,
    name: "National",
    tag: "Inclus dans le catalogue de base",
    accent: "var(--accent)",
    body: "Le programme officiel marocain, couvert de bout en bout. Tout ce qu'il faut pour réussir l'année et les examens nationaux.",
    points: ["Programme officiel complet", "Annales & examens nationaux", "Accès immédiat"],
  },
  {
    icon: GlobeIcon,
    name: "International",
    tag: "Module complémentaire",
    accent: "var(--blue)",
    body: "Pour les apprenants qui visent des curricula étrangers et une ouverture au-delà du programme national.",
    points: ["Curricula internationaux", "Contenus en plusieurs systèmes", "Préparation aux équivalences"],
  },
  {
    icon: SparkIcon,
    name: "Élite",
    tag: "Module complémentaire",
    accent: "var(--gold)",
    body: "Le niveau le plus exigeant : contenus avancés, défis et accompagnement renforcé pour viser l'excellence.",
    points: ["Contenus avancés & défis", "Accompagnement renforcé", "Préparation concours"],
  },
];

const pricing = [
  {
    name: "Découverte",
    price: "0",
    period: "/ pour toujours",
    body: "Pour commencer et explorer le programme National.",
    cta: "Commencer gratuitement",
    featured: false,
    features: ["Programme National 🇲🇦", "Leçons & exercices de base", "Suivi de progression"],
  },
  {
    name: "Ambition",
    price: "99",
    period: "DH / mois",
    body: "Pour les apprenants sérieux qui veulent tout débloquer.",
    cta: "Choisir Ambition",
    featured: true,
    features: [
      "Tout le programme National",
      "Annales & examens corrigés",
      "Module International 🌍 inclus",
      "Suivi avancé & objectifs",
    ],
  },
  {
    name: "Élite",
    price: "199",
    period: "DH / mois",
    body: "Pour viser l'excellence et les concours les plus exigeants.",
    cta: "Passer à Élite",
    featured: false,
    features: [
      "Tout le plan Ambition",
      "Module Élite ✦ complet",
      "Contenus avancés & défis",
      "Accompagnement renforcé",
    ],
  },
];

const testimonials = [
  {
    quote:
      "J'ai enfin compris des chapitres qui me bloquaient depuis des mois. Les leçons vont droit au but et les exercices ressemblent vraiment à l'examen.",
    name: "Yasmine B.",
    role: "Élève en Terminale Sciences",
  },
  {
    quote:
      "Le suivi de progression motive vraiment. On voit ce qu'on maîtrise, ce qu'on doit revoir — et on avance sans se disperser.",
    name: "Karim El M.",
    role: "Parent d'élève",
  },
  {
    quote:
      "Pouvoir travailler en français et en arabe sur la même plateforme change tout pour nos élèves. C'est clair, sérieux et bien pensé.",
    name: "Mme Najwa R.",
    role: "Enseignante, école partenaire",
  },
];

const stats = [
  { value: "3", label: "niveaux : National, International, Élite" },
  { value: "FR · AR", label: "expérience entièrement bilingue" },
  { value: "Multi", label: "écoles, une même qualité" },
];

/* ---------- Page ---------- */
export default function Home() {
  return (
    <div id="top" className="relative min-h-dvh overflow-x-hidden">
      <SiteNav />

      <main>
        {/* Hero */}
        <section className="relative mx-auto max-w-6xl px-5 pb-20 pt-32 sm:px-6 sm:pt-40">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-3.5 py-1.5 text-xs font-medium tracking-wide text-ink/70">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Plateforme éducative multi-écoles
            </span>

            <h1 className="font-display mt-6 text-balance text-5xl font-semibold leading-[1.02] tracking-tight text-ink sm:text-6xl md:text-7xl">
              Comprends la leçon.{" "}
              <span className="italic text-accent">Maîtrise l'examen.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink/65">
              IqraaNow accompagne les apprenants ambitieux — du premier cours
              jusqu'au jour de l'épreuve. National, International et Élite, en
              français et en arabe.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={PLATFORM_URL}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-base font-semibold text-white shadow-[0_8px_24px_-8px_rgba(236,92,31,0.55)] transition-colors duration-200 hover:bg-accent-dark sm:w-auto cursor-pointer"
              >
                Accéder à la plateforme
                <ArrowIcon className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>
              <a
                href="#niveaux"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-ink/15 bg-white/60 px-7 py-3.5 text-base font-semibold text-ink transition-colors duration-200 hover:bg-white sm:w-auto cursor-pointer"
              >
                Découvrir les niveaux
              </a>
            </div>

            <p className="mt-5 text-sm text-ink/45">
              Programme National accessible gratuitement — sans carte bancaire.
            </p>
          </div>

          {/* Stats strip */}
          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-ink/10 bg-ink/10 sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} className="bg-paper px-6 py-7 text-center">
                <div className="font-display text-3xl font-semibold text-ink">{s.value}</div>
                <div className="mt-1 text-sm text-ink/55">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ExamReady Zen CTA Banner */}
        <section className="mx-auto max-w-6xl px-5 py-6 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink to-ink-2 p-8 md:p-10 border border-ink/10 shadow-lg text-white flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Background SVG shape for premium effect */}
            <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-10 pointer-events-none hidden md:block">
              <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-accent-light">
                <circle cx="80" cy="50" r="40" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3,3" />
                <path d="M 40,50 L 80,10 M 80,10 L 120,50" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>

            <div className="flex-1 flex flex-col gap-4 relative z-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-accent text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                  Exclusivité 6AEP 🚀
                </span>
                <span className="bg-white/10 text-white/90 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                  Évaluation Intel Coach
                </span>
              </div>

              <h2 className="font-display text-2xl md:text-4xl font-semibold leading-tight tracking-tight">
                Diagnostic Math 6AEP — Commencer gratuitement
              </h2>

              <p className="text-sm md:text-base text-paper-3/95 leading-relaxed max-w-2xl">
                Commence par connaître ton niveau. ExamReady Zen identifie tes points faibles, t’explique chaque notion avec des visuels, puis te propose un entraînement ciblé.
              </p>

              {/* Pedagogy Mentions Grid */}
              <div className="grid grid-cols-2 gap-3 mt-2 sm:grid-cols-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-paper/90">
                  <span className="text-accent text-sm">🎯</span> Diagnostic personnalisé
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-paper/90">
                  <span className="text-blue text-sm">📐</span> Explications visuelles
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-paper/90">
                  <span className="text-green text-sm">🇸🇬</span> Méthodes internationales
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-paper/90">
                  <span className="text-gold text-sm">🏋️‍♂️</span> Entraînement ciblé
                </div>
              </div>
            </div>

            <div className="shrink-0 relative z-10 w-full md:w-auto text-center">
              <a
                href="/examready-zen/math-diagnostic"
                className="group inline-flex w-full md:w-auto items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-semibold text-white shadow-[0_8px_24px_-8px_rgba(236,92,31,0.55)] transition-colors duration-200 hover:bg-accent-dark cursor-pointer border border-accent"
              >
                Lancer mon diagnostic
                <ArrowIcon className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="fonctionnalites" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              Pourquoi IqraaNow
            </p>
            <h2 className="font-display mt-3 text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
              Tout ce qu'il faut pour apprendre — et réussir.
            </h2>
            <p className="mt-4 text-lg text-ink/60">
              Une expérience pensée pour la compréhension réelle, la régularité
              et la performance le jour de l'examen.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const FeatureIcon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group rounded-2xl border border-ink/10 bg-white/70 p-6 transition-colors duration-200 hover:border-accent/40 hover:bg-white"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white">
                    <FeatureIcon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display mt-5 text-xl font-semibold text-ink">{f.title}</h3>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-ink/60">{f.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Niveaux */}
        <section id="niveaux" className="scroll-mt-24 bg-ink py-24 text-paper">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-light">
                Trois niveaux d'ambition
              </p>
              <h2 className="font-display mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                Un parcours pour chaque objectif.
              </h2>
              <p className="mt-4 text-lg text-paper/60">
                Commence avec le programme National, puis débloque l'International
                et l'Élite quand tu veux aller plus loin.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
              {niveaux.map((n) => {
                const NiveauIcon = n.icon;
                return (
                <div
                  key={n.name}
                  className="flex flex-col rounded-2xl border border-white/10 bg-ink-2 p-7 transition-colors duration-200 hover:border-white/25"
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ backgroundColor: "rgba(255,255,255,0.06)", color: n.accent }}
                  >
                    <NiveauIcon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display mt-5 text-2xl font-semibold" style={{ color: n.accent }}>
                    {n.name}
                  </h3>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-paper/45">
                    {n.tag}
                  </p>
                  <p className="mt-4 text-[0.95rem] leading-relaxed text-paper/65">{n.body}</p>
                  <ul className="mt-6 space-y-2.5 border-t border-white/10 pt-6">
                    {n.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-2.5 text-sm text-paper/80">
                        <CheckIcon className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="tarifs" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              Tarifs simples
            </p>
            <h2 className="font-display mt-3 text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
              Choisis ton niveau d'engagement.
            </h2>
            <p className="mt-4 text-lg text-ink/60">
              Commence gratuitement. Passe à la vitesse supérieure quand tu es prêt.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {pricing.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border p-7 transition-colors duration-200 ${
                  plan.featured
                    ? "border-accent bg-white shadow-[0_16px_48px_-16px_rgba(236,92,31,0.35)]"
                    : "border-ink/10 bg-white/70 hover:border-ink/20"
                }`}
              >
                {plan.featured && (
                  <span className="absolute -top-3 left-7 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
                    Recommandé
                  </span>
                )}
                <h3 className="font-display text-xl font-semibold text-ink">{plan.name}</h3>
                <p className="mt-1 text-sm text-ink/55">{plan.body}</p>
                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className="font-display text-5xl font-semibold text-ink">{plan.price}</span>
                  <span className="text-sm text-ink/50">{plan.period}</span>
                </div>
                <ul className="mt-6 space-y-2.5 border-t border-ink/10 pt-6">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm text-ink/70">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={PLATFORM_URL}
                  className={`mt-8 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-colors duration-200 cursor-pointer ${
                    plan.featured
                      ? "bg-accent text-white hover:bg-accent-dark"
                      : "border border-ink/15 text-ink hover:bg-ink/5"
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-paper-2 py-24">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                Ils nous font confiance
              </p>
              <h2 className="font-display mt-3 text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
                Des résultats qui parlent.
              </h2>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
              {testimonials.map((t) => (
                <figure
                  key={t.name}
                  className="flex flex-col rounded-2xl border border-ink/10 bg-white p-7"
                >
                  <QuoteIcon className="h-7 w-7 text-accent/40" />
                  <blockquote className="mt-4 flex-1 text-[0.95rem] leading-relaxed text-ink/75">
                    {t.quote}
                  </blockquote>
                  <figcaption className="mt-6 border-t border-ink/10 pt-4">
                    <div className="font-display text-base font-semibold text-ink">{t.name}</div>
                    <div className="text-sm text-ink/55">{t.role}</div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24 sm:px-6">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              Questions fréquentes
            </p>
            <h2 className="font-display mt-3 text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
              Tout ce que tu veux savoir.
            </h2>
          </div>
          <Faq />
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-16 text-center text-paper sm:px-12 sm:py-20">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 0%, rgba(236,92,31,0.22), transparent 45%), radial-gradient(circle at 85% 100%, rgba(44,95,141,0.18), transparent 45%)",
              }}
              aria-hidden="true"
            />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                Prêt à comprendre — et à réussir ?
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-lg text-paper/65">
                Rejoins les apprenants ambitieux qui transforment chaque leçon en
                résultat. Le programme National t'attend.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  href={PLATFORM_URL}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-base font-semibold text-white transition-colors duration-200 hover:bg-accent-dark sm:w-auto cursor-pointer"
                >
                  Accéder à la plateforme
                  <ArrowIcon className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </a>
                <a
                  href="#tarifs"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-base font-semibold text-paper transition-colors duration-200 hover:bg-white/10 sm:w-auto cursor-pointer"
                >
                  Voir les tarifs
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-ink/10 bg-paper">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-5 py-10 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2.5">
            <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
              <defs>
                <linearGradient id="footlogo" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ff7a3d" />
                  <stop offset="100%" stopColor="#c64715" />
                </linearGradient>
              </defs>
              <rect width="32" height="32" rx="8" fill="url(#footlogo)" />
              <path d="M 6 12.5 Q 11 11 16 13.5 L 16 22.5 Q 11 21 6 22 Z" fill="white" opacity="0.96" />
              <path d="M 26 12.5 Q 21 11 16 13.5 L 16 22.5 Q 21 21 26 22 Z" fill="white" opacity="0.96" />
              <line x1="16" y1="13.5" x2="16" y2="22.5" stroke="#fde6c9" strokeWidth="1.1" strokeLinecap="round" />
            </svg>
            <span className="font-display text-base font-semibold text-ink">IqraaNow 5.0</span>
          </div>
          <p className="text-sm text-ink/50">
            Comprends la leçon, maîtrise l'examen. · National · International · Élite
          </p>
          <p className="text-sm text-ink/40">
            © {new Date().getFullYear()} IqraaNow. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
