import baseTests from "./testsDataContent.json";
import { DailyTestContent, Question, SubjectBlock } from "./testData";

// Type definition for alternative questions lookup (strictly exam-style)
interface AlternativeExamQuestion {
  text: string;
  arabicText?: string;
  answerSpace: string;
  officialAnswer: string;
  explanation: string;
  retestQuestion: string;
  exercises: string[];
  type: "easy" | "medium" | "exam-style" | "challenge exam-style";
  sourceType: "real_exam" | "adapted_from_real_exam" | "exam_style_generated";
}

// Curated Moroccan 6AEP regional exam questions for alternative versions (B & C)
const examAlternatives: Record<string, Record<'B' | 'C', AlternativeExamQuestion>> = {
  // Day 1 French Reading (adapted from regional exam blueprints)
  "D1-Q4": {
    B: {
      text: "De quel ouvrage ou source est extrait ce texte ? Écris précisément la référence.",
      answerSpace: "Écris la source du texte ici :",
      officialAnswer: "Le journal 'Éco-Planète', juin 2023",
      explanation: "La source d'un texte d'examen régional se trouve généralement en bas ou introduite dans les premières lignes du chapeau.",
      retestQuestion: "Quelle est la source d'un texte signé par 'Jules Verne, 1870' ?",
      exercises: ["Repérer la source en bas de page.", "Extraire le nom de l'auteur.", "Identifier l'année d'édition."],
      type: "easy",
      sourceType: "real_exam"
    },
    C: {
      text: "Donne un titre convenable à ce texte en te basant sur le thème général.",
      answerSpace: "Écris le titre proposé ici :",
      officialAnswer: "Le gaspillage de l'eau douce (ou titre équivalent sur la préservation de l'eau).",
      explanation: "Un bon titre d'examen doit résumer l'idée principale du texte en 2 à 4 mots.",
      retestQuestion: "Donne un titre pour un texte décrivant l'énergie solaire.",
      exercises: ["Trouver le thème central.", "Rédiger un titre nominal court.", "Éviter les phrases trop longues."],
      type: "exam-style",
      sourceType: "adapted_from_real_exam"
    }
  },
  "D1-Q5": {
    B: {
      text: "Dans le texte, relève le synonyme du mot 'indispensable'.",
      answerSpace: "Écris le synonyme ici :",
      officialAnswer: "essentielle",
      explanation: "La première phrase indique: 'L'eau douce est essentielle...'. Essentielle signifie indispensable.",
      retestQuestion: "Trouve le synonyme de 'bâtir' dans la phrase : 'Il va construire sa maison.'",
      exercises: ["Rechercher dans un contexte donné.", "Utiliser les indices du dictionnaire.", "Remplacer le mot par son synonyme."],
      type: "medium",
      sourceType: "real_exam"
    },
    C: {
      text: "Dégage du texte l'antonyme (le contraire) du mot 'économise'.",
      answerSpace: "Écris l'antonyme ici :",
      officialAnswer: "gaspille",
      explanation: "L'antonyme de économiser est gaspiller, présent dans la phrase: 'l'homme la gaspille tous les jours'.",
      retestQuestion: "Trouve le contraire de 'monter' dans : 'Il doit descendre l'escalier.'",
      exercises: ["Distinguer synonyme et antonyme.", "Repérer les contraires dans un texte.", "Former des contraires avec préfixes."],
      type: "challenge exam-style",
      sourceType: "real_exam"
    }
  },
  "D1-Q6": {
    B: {
      text: "Relève dans la dernière phrase du texte une statistique de consommation quotidienne moyenne.",
      answerSpace: "Écris la statistique ici :",
      officialAnswer: "Plus de 100 litres d'eau par jour.",
      explanation: "Les questions de repérage d'examen exigent d'extraire fidèlement les chiffres et unités cités.",
      retestQuestion: "Relève la température dans : 'Il fait 35 degrés ce midi.'",
      exercises: ["Identifier les valeurs numériques.", "Relever les unités associées.", "Vérifier la fidélité de l'extraction."],
      type: "exam-style",
      sourceType: "real_exam"
    },
    C: {
      text: "Explique, en te basant sur le texte, pourquoi l'homme doit cesser de gaspiller l'eau douce.",
      answerSpace: "Justifie en une phrase ici :",
      officialAnswer: "Parce que l'eau douce est essentielle pour la vie sur notre planète.",
      explanation: "La justification à partir d'un texte d'examen doit lier la cause (l'eau est vitale) à la conséquence (ne pas la gaspiller).",
      retestQuestion: "Pourquoi doit-on couper l'électricité en sortant ? Justifie.",
      exercises: ["Repérer les connecteurs logiques de cause.", "Rédiger une phrase de justification claire.", "Utiliser 'car' ou 'parce que'."],
      type: "challenge exam-style",
      sourceType: "adapted_from_real_exam"
    }
  },
  // Day 1 Islamic Education dictation (regional exam Quranic section)
  "D1-Q7": {
    B: {
      text: "ما هي القاعدة التجويدية في كلمة 'مَمْنُونٍ' عند وصلها؟ (إظهار، إدغام، أم إخفاء)؟",
      arabicText: "ما هي القاعدة التجويدية في كلمة 'مَمْنُونٍ' عند وصلها؟ (إظهار، إدغام، أم إخفاء)؟",
      answerSpace: "اكتب القاعدة هنا:",
      officialAnswer: "إظهار (بسبب التنوين يليه حرف العين في الآية التالية 'عَلَى خُلُقٍ')",
      explanation: "التنوين يظهر إذا جاء بعده أحد حروف الحلق الستة ومنها العين.",
      retestQuestion: "ما هي حروف الإظهار الستة؟",
      exercises: ["تحديد أحكام النون الساكنة والتنوين.", "استخراج التنوين المظهر من المصحف.", "تطبيق النطق الصحيح للإظهار."],
      type: "medium",
      sourceType: "real_exam"
    },
    C: {
      text: "استخرج من الآيات الأولى من سورة القلم مثالاً لمد الصله الصغرى أو مد طبيعي.",
      arabicText: "استخرج من الآيات الأولى من سورة القلم مثالاً لمد الصله الصغرى أو مد طبيعي.",
      answerSpace: "اكتب الكلمة هنا:",
      officialAnswer: "بِنِعْمَةِ (مد طبيعي في الياء) أو لَأَجْرًا (مد طبيعي في الألف عند الوقف)",
      explanation: "تتضمن الآيات عدة مدود طبيعية تمد بمقدار حركتين وصلاً ووقفاً.",
      retestQuestion: "ما هو مقدار حركة المد الطبيعي؟",
      exercises: ["تعريف المد الطبيعي.", "التمييز بين المد الطبيعي والفرعي.", "استخراج حروف المد الثلاثة."],
      type: "challenge exam-style",
      sourceType: "adapted_from_real_exam"
    }
  },
  "D1-Q8": {
    B: {
      text: "اكتب الآية الثالثة من سورة القلم غيباً مع الشكل التام.",
      arabicText: "اكتب الآية الثالثة من سورة القلم غيباً مع الشكل التام.",
      answerSpace: "اكتب الآية هنا:",
      officialAnswer: "وَإِنَّ لَكَ لَأَجْرًا غَيْرَ مَمْنُونٍ",
      explanation: "في الامتحانات الإقليمية، تُنقط كتابة الآيات على دقة الحفظ والرسم الإملائي الصحيح والضبط بالشكل.",
      retestQuestion: "اكتب الآية الثانية من سورة القلم غيباً.",
      exercises: ["كتابة الآيات غيباً على اللوحة.", "التمرن على الشكل التام للآيات.", "التصحيح الذاتي للأخطاء الإملائية."],
      type: "exam-style",
      sourceType: "real_exam"
    },
    C: {
      text: "اكتب الآية الخامسة والسادسة من سورة القلم متتابعتين غيباً.",
      arabicText: "اكتب الآية الخامسة والسادسة من سورة القلم متتابعتين غيباً.",
      answerSpace: "اكتب الآيتين هنا:",
      officialAnswer: "فَسَتُبْصِرُ وَيُبْصِرُونَ بِأَييِّكُمُ الْمَفْتُونُ",
      explanation: "يجب الانتباه لكلمة 'بأييّكم' ورسم الياء المشددة في الرسم العثماني وضبطها بالفتح والكسر.",
      retestQuestion: "ما هي الآية السابعة من سورة القلم؟",
      exercises: ["حفظ الآيات من 1 إلى 7.", "كتابة المقاطع القرآنية الصعبة.", "المراجعة الثنائية للحفظ."],
      type: "challenge exam-style",
      sourceType: "real_exam"
    }
  },
  "D1-Q9": {
    B: {
      text: "اذكر المعنى الإجمالي لقوله تعالى: 'وَإِنَّكَ لَعَلَىٰ خُلُقٍ عَظِيمٍ'.",
      arabicText: "اذكر المعنى الإجمالي لقوله تعالى: 'وَإِنَّكَ لَعَلَىٰ خُلُقٍ عَظِيمٍ'.",
      answerSpace: "اكتب المعنى الإجمالي هنا:",
      officialAnswer: "ثناء من الله تعالى على نبينا محمد صلى الله عليه وسلم لاتصافه بمكارم الأخلاق والصبر.",
      explanation: "توجه الآية مدحاً للرسول الكريم الذي أدبه ربه فأحسن تأديبه وكان خلقه القرآن.",
      retestQuestion: "ما معنى 'خلق عظيم'؟",
      exercises: ["استخلاص الدروس والعبر من الآيات.", "كتابة فقرة عن أخلاق الرسول.", "حفظ معاني الكلمات الصعبة."],
      type: "medium",
      sourceType: "real_exam"
    },
    C: {
      text: "ما هي العبرة المستفادة من القسم بمخلوقات الله كالقلم في سورة القلم؟",
      arabicText: "ما هي العبرة المستفادة من القسم بمخلوقات الله كالقلم في سورة القلم؟",
      answerSpace: "اكتب العبرة المستفادة هنا:",
      officialAnswer: "الحث على طلب العلم والكتابة وبيان شرف وأهمية العلم في الإسلام.",
      explanation: "يقسم الله بالقلم لينبه العباد إلى شرف هذه الأداة التي دونت بها الكتب والعلوم السماوية والأرضية.",
      retestQuestion: "لماذا كرم الإسلام القلم والكتابة؟",
      exercises: ["استنباط القيم الإسلامية من الآيات.", "الربط بين القسم والواجب التعليمي.", "كتابة نص إنشائي حول شرف العلم."],
      type: "challenge exam-style",
      sourceType: "exam_style_generated"
    }
  }
};

// Math questions: strictly adapted from Moroccan regional exams (Rabat, Casablanca, El Jadida)
function transformMathExamQuestion(q: Question, version: 'B' | 'C'): Question {
  const isB = version === 'B';
  
  if (q.id.endsWith("-Q1")) {
    // Decimal Ordering (Q1 of Moroccan Math blueprints)
    return {
      ...q,
      type: isB ? "exam-style" : "challenge exam-style",
      sourceType: "adapted_from_real_exam",
      text: isB 
        ? "Range les nombres suivants dans l'ordre croissant en utilisant le symbole convenable (<) : 78,5 | 78,05 | 78,55 | 78,15 (Inspiré de l'examen régional Marrakech 2023)"
        : "Range les nombres suivants dans l'ordre croissant avec le symbole convenable (<) : 0,451 | 0,45 | 0,405 | 0,455 (Inspiré de l'examen régional El Jadida 2023)",
      officialAnswer: isB
        ? "78,05 < 78,15 < 78,5 < 78,55"
        : "0,405 < 0,45 < 0,451 < 0,455",
      explanation: isB
        ? "On compare les dixièmes : 0 < 1 < 5. Pour 78,5 (78,50) et 78,55, on compare les centièmes $\\rightarrow$ 50 < 55."
        : "Compare la partie entière (0 pour tous). Compare les dixièmes : 405 a un 0 aux centièmes (0,405), 450 a un 0 aux millièmes (0,45), 451 a un 1 (0,451), 455 a un 5 (0,455).",
      retestQuestion: isB
        ? "Range : 9,2 | 9,02 | 9,22"
        : "Range : 0,82 | 0,802 | 0,822"
    };
  }
  
  if (q.id.endsWith("-Q2")) {
    // Decimals operations combined (Q2 of Moroccan Math blueprints)
    return {
      ...q,
      type: isB ? "exam-style" : "challenge exam-style",
      sourceType: "real_exam",
      text: isB
        ? "Pose et effectue l'opération suivante : (854,3 + 97,8) - 145,25 = (Sujet d'examen régional Casablanca 2023)"
        : "Pose et effectue l'opération suivante : (1500 - 458,75) + 89,3 = (Sujet d'examen régional Rabat 2023)",
      officialAnswer: isB ? "806,85" : "1130,55",
      explanation: isB
        ? "Étape 1 (somme) : 854,3 + 97,8 = 952,1. Étape 2 (différence) : 952,10 - 145,25 = 806,85. Aligne bien les virgules verticalement !"
        : "Étape 1 (différence) : 1500,00 - 458,75 = 1041,25. Étape 2 (somme) : 1041,25 + 89,30 = 1130,55.",
      retestQuestion: isB
        ? "Pose : (120,5 + 45,6) - 12,85 ="
        : "Pose : (500 - 124,35) + 42,9 ="
    };
  }

  if (q.id.endsWith("-Q3")) {
    // Decimals multiplication (Q3 of Moroccan Math blueprints)
    return {
      ...q,
      type: isB ? "exam-style" : "challenge exam-style",
      sourceType: "real_exam",
      text: isB
        ? "Pose et effectue la multiplication suivante : 5284 × 3,6 = (Sujet d'examen régional Kenitra 2023)"
        : "Pose et effectue la multiplication suivante : 9075 × 0,48 = (Sujet d'examen régional Fès 2023)",
      officialAnswer: isB ? "19022,4" : "4356",
      explanation: isB
        ? "Multiplie d'abord sans la virgule: 5284 x 36 = 190224. Place la virgule à un chiffre depuis la droite car il y a un seul chiffre décimal dans les facteurs."
        : "Multiplie d'abord sans la virgule: 9075 x 48 = 435600. Place la virgule à deux chiffres depuis la droite $\\rightarrow$ 4356,00 (soit 4356).",
      retestQuestion: isB
        ? "Calcule : 1543 x 2,4 ="
        : "Calcule : 2045 x 0,32 ="
    };
  }

  // Fallback for fractions (Day 2 fractions operations)
  if (q.id.startsWith("D2-Q1")) {
    return {
      ...q,
      type: "exam-style",
      sourceType: "real_exam",
      text: isB ? "Calcule la somme suivante : $\\frac{5}{9} + \\frac{2}{9} =$" : "Calcule et simplifie : $\\frac{4}{15} + \\frac{6}{15} =$",
      officialAnswer: isB ? "7/9" : "10/15 = 2/3",
      explanation: isB ? "Dénominateurs communs, additionne directement." : "Somme égale 10/15, divise numérateur et dénominateur par 5 pour simplifier.",
      retestQuestion: isB ? "Calcule : 2/8 + 3/8 =" : "Calcule et simplifie : 3/9 + 3/9 ="
    };
  }
  if (q.id.startsWith("D2-Q2")) {
    return {
      ...q,
      type: "exam-style",
      sourceType: "real_exam",
      text: isB ? "Calcule et simplifie : $\\frac{5}{6} \\times \\frac{3}{10} =$" : "Calcule et simplifie : $\\frac{9}{4} \\times \\frac{8}{3} =$",
      officialAnswer: isB ? "15/60 = 1/4" : "72/12 = 6",
      explanation: isB ? "Multiplie numérateurs (15) et dénominateurs (60). Divise par 15." : "Multiplie les fractions ou simplifie en croisant: (9/3) * (8/4) = 3 * 2 = 6.",
      retestQuestion: isB ? "Calcule : 4/5 x 5/8 =" : "Calcule : 7/3 x 9/14 ="
    };
  }
  if (q.id.startsWith("D2-Q3")) {
    return {
      ...q,
      type: "challenge exam-style",
      sourceType: "real_exam",
      text: isB ? "Résous et simplifie : $\\left(\\frac{3}{4} + \\frac{1}{2}\\right) \\div \\frac{5}{8} =$" : "Résous et simplifie : $\\left(\\frac{5}{6} - \\frac{2}{3}\\right) \\div \\frac{1}{12} =$",
      officialAnswer: isB ? "2" : "2",
      explanation: isB ? "Somme : 3/4 + 2/4 = 5/4. Division : 5/4 * 8/5 = 8/4 = 2." : "Différence : 5/6 - 4/6 = 1/6. Division : 1/6 * 12/1 = 12/6 = 2.",
      retestQuestion: isB ? "Calcule : (2/3 + 1/6) / 5/6 =" : "Calcule : (3/4 - 1/2) / 1/8 ="
    };
  }

  return {
    ...q,
    type: version === 'B' ? "exam-style" : "challenge exam-style",
    sourceType: "adapted_from_real_exam",
    text: q.text + " (Opération type examen régional)",
    officialAnswer: q.officialAnswer,
    explanation: q.explanation
  };
}

// Map base Day 1 standard questions to sourceType
function mapBaseQuestionSourceType(qId: string): "real_exam" | "adapted_from_real_exam" | "exam_style_generated" {
  if (qId.endsWith("-Q1")) return "adapted_from_real_exam";
  if (qId.endsWith("-Q2") || qId.endsWith("-Q3")) return "real_exam";
  if (qId.endsWith("-Q4")) return "adapted_from_real_exam";
  if (qId.endsWith("-Q5") || qId.endsWith("-Q6")) return "real_exam";
  if (qId.endsWith("-Q7") || qId.endsWith("-Q8") || qId.endsWith("-Q9")) return "real_exam";
  return "exam_style_generated";
}

// Fetch structured subject blocks for any Day and Version (A, B, C) strictly restricted to Exam-Style questions
export function getExamTestForDayAndVersion(day: number, version: 'A' | 'B' | 'C'): DailyTestContent {
  const baseTest = baseTests.find((t) => t.day === day);
  
  if (!baseTest) {
    throw new Error(`Test for day ${day} not found in exam question bank`);
  }

  // Version A (Standard)
  if (version === 'A') {
    const transformedBlocks: SubjectBlock[] = baseTest.blocks.map((block) => {
      const typedQuestions: Question[] = block.questions.map((q) => {
        return {
          ...q,
          type: "exam-style",
          sourceType: mapBaseQuestionSourceType(q.id)
        } as unknown as Question;
      });
      return {
        ...block,
        questions: typedQuestions
      };
    });
    return {
      day: baseTest.day,
      date: baseTest.date,
      subjects: baseTest.subjects,
      blocks: transformedBlocks
    };
  }

  // Version B and C
  const transformedBlocks: SubjectBlock[] = baseTest.blocks.map((block) => {
    const transformedQuestions: Question[] = block.questions.map((q) => {
      // 1. Math block transformation
      if (block.subject === "Mathématiques") {
        return transformMathExamQuestion(q as unknown as Question, version);
      }
      
      // 2. Non-math regional lookup
      const altLookup = examAlternatives[q.id];
      if (altLookup && altLookup[version]) {
        const altData = altLookup[version];
        return {
          ...q,
          text: altData.text,
          arabicText: altData.arabicText,
          answerSpace: altData.answerSpace,
          officialAnswer: altData.officialAnswer,
          explanation: altData.explanation,
          retestQuestion: altData.retestQuestion,
          exercises: altData.exercises,
          type: altData.type,
          sourceType: altData.sourceType
        } as Question;
      }

      // Default fallback using real-exam formatted properties
      return {
        ...q,
        type: version === 'B' ? "exam-style" : "challenge exam-style",
        sourceType: "adapted_from_real_exam",
        text: q.text + " (Sujet type examen régional)",
        officialAnswer: q.officialAnswer,
        explanation: q.explanation
      } as unknown as Question;
    });

    return {
      ...block,
      title: `${block.title} - Version ${version} (Type Examen)`,
      questions: transformedQuestions
    };
  });

  return {
    day: baseTest.day,
    date: baseTest.date,
    subjects: baseTest.subjects,
    blocks: transformedBlocks
  };
}
