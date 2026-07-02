export interface DailyTestMeta {
  day: number;
  date: string;
  subjects: string[];
  lessons: string[];
  status: "not started" | "completed" | "needs review";
  score?: string;
  duration: string;
  parentNote: string;
  calmReminder: string;
}

export interface Question {
  id: string;
  type: "easy" | "medium" | "exam-style" | "challenge exam-style";
  text: string;
  arabicText?: string;
  answerSpace: string;
  officialAnswer: string;
  explanation: string;
  mistakeRouting: string;
  exercises: string[];
  retestQuestion: string;
  sourceType: "real_exam" | "adapted_from_real_exam" | "exam_style_generated";
}

export interface SubjectBlock {
  subject: string;
  title: string;
  objective: string;
  estimatedDuration: string;
  questions: Question[];
}

export interface DailyTestContent {
  day: number;
  date: string;
  subjects: string[];
  blocks: SubjectBlock[];
}

export interface MistakeEntry {
  date: string;
  day: number;
  subject: string;
  questionNo: string;
  lessonName: string;
  lessonLink: string;
  mistakeType: string;
  actionTaken: string;
  status: "improved" | "still weak";
}

export interface DashboardRow {
  date: string;
  day: number;
  score: string;
  weakTopics: string;
  status: "improved" | "still weak";
  recommendation: string;
  signoff: string;
}

export interface ChecklistItem {
  id: string;
  category: "morning" | "bag" | "mind" | "during";
  title: string;
  titleAr?: string;
  description?: string;
  checked: boolean;
}

export const younesProfile = {
  name: "Younes",
  birthYear: 2014,
  level: "6AEP",
  examDate: "26 Juin 2026",
  daysRemaining: 8,
  overallProgress: 12.5, // 1/8 completed
  averageScore: "77.8%", // 7/9 on Day 1
  weakTopics: ["Brackets décimaux (Math)", "Orthographe 'ما أنت' (Arab)"],
};

export const dailyTestsMetadata: DailyTestMeta[] = [
  {
    day: 1,
    date: "18 Juin 2026",
    subjects: ["Mathématiques", "Français", "Éducation Islamique"],
    lessons: ["Bracket décimaux (Leçon 4)", "Compréhension (Unit 5)", "Surat al-Qalam (verses 1-7)"],
    status: "completed",
    score: "7/9",
    duration: "25 minutes",
    parentNote: "Vérifier que Younes écrit le zéro de remplacement pour l'alignement des décimaux (ex. 850,0).",
    calmReminder: "Prends 3 lentes inspirations (respiration carrée). Lis le texte de français deux fois avant de répondre.",
  },
  {
    day: 2,
    date: "19 Juin 2026",
    subjects: ["Mathématiques", "Français", "Langue Arabe"],
    lessons: ["Opérations sur les fractions (Leçon 11)", "Synonymes & Suffixes (Units 2 & 4)", "تصريف الفعل الصحيح والمعتل (الوحدة 1)"],
    status: "not started",
    duration: "25 minutes",
    parentNote: "Surveiller les simplifications de fractions. Demander à Younes de simplifier avant de multiplier.",
    calmReminder: "Rappelle-toi pour les fractions : écris clairement les dénominateurs communs. En arabe, observe les verbes معتل !",
  },
  {
    day: 3,
    date: "20 Juin 2026",
    subjects: ["Mathématiques", "Français", "Éducation Islamique"],
    lessons: ["Division décimale (Leçon 29)", "COD/COI, Cause, Voix Passive (Units 2, 3 & 5)", "الصيام: تعريفه وأعذاره (الوحدة 3)"],
    status: "not started",
    duration: "30 minutes",
    parentNote: "Aucune calculatrice n'est autorisée. Surveiller la propreté de la pose verticale.",
    calmReminder: "Pas de virgule dans le diviseur ! Multiplie par 10 ou 100 pour rendre le diviseur entier.",
  },
  {
    day: 4,
    date: "21 Juin 2026",
    subjects: ["Mathématiques", "Français", "Langue Arabe"],
    lessons: ["Nombres sexagésimaux (Leçon 21)", "Conjugaison Présent & Futur (Units 1 & 2)", "التراكيب: الأفعال الخمسة والنصب والجزم"],
    status: "not started",
    duration: "25 minutes",
    parentNote: "Aider Younes avec la retenue en base 60 pour les minutes et secondes.",
    calmReminder: "1 heure = 60 minutes. Quand tu empruntes du temps, fais-le en base 60. En arabe, supprime le 'ن' des cinq verbes.",
  },
  {
    day: 5,
    date: "22 Juin 2026",
    subjects: ["Mathématiques", "Français", "Éducation Islamique"],
    lessons: ["Angles & Bissectrice (Leçon 14)", "Production écrite (Water eco-themes) (Unit 5)", "الاقتداء: قصة آل ياسر وعبر الاستقامة"],
    status: "not started",
    duration: "30 minutes",
    parentNote: "Préparer compas, règle et rapporteur. Compter le nombre de lignes écrites en français (min. 7 lignes).",
    calmReminder: "Garde ton crayon bien taillé ! La bissectrice coupe l'angle exactement en deux. Utilise tes connecteurs en français.",
  },
  {
    day: 6,
    date: "23 Juin 2026",
    subjects: ["Mathématiques", "Français", "Langue Arabe"],
    lessons: ["Conversions métriques (Leçon 3 & 9)", "Accords, Pluriels, Homophones (Units 1, 4 & 5)", "الإملاء والشكل: كتابة ابن، الهمزات"],
    status: "not started",
    duration: "30 minutes",
    parentNote: "Demander à Younes de dessiner les tableaux de conversion avant de commencer.",
    calmReminder: "Dessine d'abord ton tableau ! Rappelle-toi que 1 dm³ = 1 L. En arabe, applique la règle de suppression du alif dans 'بن'.",
  },
  {
    day: 7,
    date: "24 Juin 2026",
    subjects: ["Mathématiques", "Langue Arabe", "Éducation Islamique"],
    lessons: ["Aire du rectangle & Volume du prisme (Leçons 7 & 10)", "التعبير الكتابي: كتابة موضوع مقالي", "تجويد: المد المنفصل (الوحدة 1)"],
    status: "not started",
    duration: "30 minutes",
    parentNote: "Vérifier que Younes mentionne bien les unités (m², m³) dans ses réponses.",
    calmReminder: "Le périmètre est 2 x (L + l). Le volume est L x l x h. Le مد منفصل est étiré de 4 à 5 temps !",
  },
  {
    day: 8,
    date: "25 Juin 2026",
    subjects: ["Mathématiques", "Français", "Langue Arabe", "Éducation Islamique"],
    lessons: ["Proportionnalité : vitesse moyenne (Leçon 31)", "Guided Writing & Vocalization final review", "قصة مريم العذراء وأحكام الصيام"],
    status: "not started",
    duration: "30 minutes",
    parentNote: "Fêter le travail accompli ! Revoir la checklist de l'examen et coucher Younes tôt (21:00).",
    calmReminder: "v = d / t. Convertis les minutes en heures décimales (ex. 1h30 = 1,5h). Reste concentré, c'est le dernier test !",
  },
];



export const mistakeLedger: MistakeEntry[] = [
  {
    date: "18 Juin 2026",
    day: 1,
    subject: "Mathématiques",
    questionNo: "Q2",
    lessonName: "Leçon 4: Les nombres décimaux",
    lessonLink: "file:///c:/Users/lenovo/OneDrive/Desktop/iqraa-history-agent/data/curriculum/mathematics_curriculum.md#leçon-4",
    mistakeType: "Soustraction incomplète des parenthèses",
    actionTaken: "A fait les 3 exercices progressifs sur les décimaux ; en attente du retest.",
    status: "still weak",
  },
  {
    date: "18 Juin 2026",
    day: 1,
    subject: "Éducation Islamique",
    questionNo: "Q8",
    lessonName: "تزكية (قرآن كريم): سورة القلم",
    lessonLink: "file:///c:/Users/lenovo/OneDrive/Desktop/iqraa-history-agent/data/curriculum/islamic_education_curriculum.md#unit-1",
    mistakeType: "خطأ إملائي في كتابة 'مَا أَنْتَ' (كتبها 'مأنت')",
    actionTaken: "A écrit 'ما أنت' 5 مرات على اللوحة واستظهر الآية بنجاح غيباً.",
    status: "still weak",
  },
];

export const dashboardOverview: DashboardRow[] = [
  {
    date: "18 Juin",
    day: 1,
    score: "7 / 9",
    weakTopics: "Parenthèses (Math), Orthographe Coran (Islam)",
    status: "still weak",
    recommendation: "Effectuer les exercices de remédiation du Jour 1 avant de commencer le Jour 2.",
    signoff: "Signé",
  },
  {
    date: "19 Juin",
    day: 2,
    score: "---",
    weakTopics: "---",
    status: "still weak",
    recommendation: "À faire demain : Opérations sur les fractions et verbes صحيح/معتل.",
    signoff: "Non signé",
  },
];

export const checklistItems: ChecklistItem[] = [
  {
    id: "chk-sleep",
    category: "morning",
    title: "Nuit de sommeil réparatrice (9h+)",
    titleAr: "النوم الكافي (أكثر من 9 ساعات)",
    description: "Se coucher impérativement à 21h00 la veille pour avoir les idées claires.",
    checked: false,
  },
  {
    id: "chk-breakfast",
    category: "morning",
    title: "Petit-déjeuner sain et léger",
    titleAr: "فطور صحي وخفيف",
    description: "Pain avec du miel, œuf, verre d'eau. Éviter les graisses pour ne pas être fatigué.",
    checked: false,
  },
  {
    id: "chk-invite",
    category: "bag",
    title: "Convocation officielle & Carte d'identité",
    titleAr: "الاستدعاء الرسمي وبطاقة التعريف",
    checked: false,
  },
  {
    id: "chk-tools",
    category: "bag",
    title: "Trousse géométrique complète",
    titleAr: "الأدوات الهندسية كاملة",
    description: "Stylos (bleu, noir), crayon taillé, règle, équerre, compas serré, rapporteur.",
    checked: false,
  },
  {
    id: "chk-breath",
    category: "mind",
    title: "Respiration carrée en cas de stress",
    titleAr: "تنفس المربع عند القلق",
    description: "Inspirer 4s, retenir 4s, expirer 4s, bloquer 4s. Répéter 3 fois.",
    checked: false,
  },
  {
    id: "chk-pacing",
    category: "during",
    title: "Gestion du temps (1h30 par épreuve)",
    titleAr: "تدبير الوقت (ساعة ونصف لكل مادة)",
    description: "Commencer par les exercices faciles (calculs, graphiques, lexique). Ne pas bloquer plus de 5 minutes.",
    checked: false,
  },
  {
    id: "chk-recheck",
    category: "during",
    title: "Vérification finale des calculs et accords (15 min)",
    titleAr: "المراجعة النهائية للحساب والقواعد (15 دقيقة)",
    description: "Vérifier les retenues en mathématiques, les accords en français, et le شكل en arabe.",
    checked: false,
  },
];
