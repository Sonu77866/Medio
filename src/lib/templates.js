// Reusable patient-intake quick templates + adaptive follow-up questions.
// Bilingual labels; complaint values are prefilled and remain fully editable.

export const PROBLEM_OPTIONS = {
  en: [
    "Fever", "Cough", "Cold", "Sore throat", "Body pain", "Headache",
    "Stomach pain", "Vomiting", "Diarrhea", "Weakness", "Breathing difficulty",
    "Skin problem", "Injury",
  ],
  hi: [
    "बुखार", "खांसी", "जुकाम", "गले में खराश", "शरीर दर्द", "सिरदर्द",
    "पेट दर्द", "उल्टी", "दस्त", "कमज़ोरी", "साँस की तकलीफ",
    "त्वचा समस्या", "चोट",
  ],
};

// key stays language-neutral; label localized
export const TEMPLATES = [
  {
    key: "fever_viral",
    icon: "Thermometer",
    label: { en: "Fever / Viral", hi: "बुखार / वायरल" },
    values: {
      problems: { en: ["Fever", "Body pain"], hi: ["बुखार", "शरीर दर्द"] },
      duration: { en: "2-3 days", hi: "2-3 दिन" },
      severity: "Moderate",
    },
    category: "fever",
  },
  {
    key: "cough_cold",
    icon: "Wind",
    label: { en: "Cough & Cold", hi: "खांसी और जुकाम" },
    values: {
      problems: { en: ["Cough", "Cold"], hi: ["खांसी", "जुकाम"] },
      duration: { en: "3-4 days", hi: "3-4 दिन" },
      severity: "Mild",
    },
    category: "cough",
  },
  {
    key: "pain",
    icon: "Activity",
    label: { en: "Pain", hi: "दर्द" },
    values: {
      problems: { en: ["Body pain"], hi: ["शरीर दर्द"] },
      duration: { en: "", hi: "" },
      severity: "Moderate",
    },
    category: "pain",
  },
  {
    key: "stomach",
    icon: "Utensils",
    label: { en: "Stomach Issue", hi: "पेट की समस्या" },
    values: {
      problems: { en: ["Stomach pain"], hi: ["पेट दर्द"] },
      duration: { en: "1-2 days", hi: "1-2 दिन" },
      severity: "Moderate",
    },
    category: "stomach",
  },
  {
    key: "weakness",
    icon: "BatteryLow",
    label: { en: "Weakness", hi: "कमज़ोरी" },
    values: {
      problems: { en: ["Weakness"], hi: ["कमज़ोरी"] },
      duration: { en: "", hi: "" },
      severity: "Mild",
    },
    category: "weakness",
  },
  {
    key: "medicine_followup",
    icon: "Pill",
    label: { en: "Medicine Follow-up", hi: "दवा फॉलो-अप" },
    values: {
      problems: { en: [], hi: [] },
      duration: { en: "", hi: "" },
      severity: "Mild",
    },
    category: "other",
  },
  {
    key: "child_visit",
    icon: "Baby",
    label: { en: "Child Visit", hi: "बच्चे की जाँच" },
    values: {
      problems: { en: [], hi: [] },
      duration: { en: "", hi: "" },
      severity: "Mild",
      relation: "Child",
    },
    category: "child",
  },
  {
    key: "checkup",
    icon: "Stethoscope",
    label: { en: "General Check-up", hi: "सामान्य जाँच" },
    values: {
      problems: { en: [], hi: [] },
      duration: { en: "", hi: "" },
      severity: "Mild",
    },
    category: "general",
  },
];

// Adaptive follow-up questions keyed by category. Answers are editable by the patient.
const FOLLOWUPS = {
  fever: {
    en: ["What is the temperature (if measured)?", "Any chills or shivering?", "How many days has the fever lasted?", "Any breathing difficulty?", "Are you able to drink fluids and stay hydrated?"],
    hi: ["तापमान कितना है (यदि मापा हो)?", "ठंड या कंपकंपी है?", "बुखार कितने दिनों से है?", "साँस लेने में तकलीफ है?", "क्या आप तरल पदार्थ लेकर हाइड्रेटेड रह पा रहे हैं?"],
  },
  cough: {
    en: ["How long has the cough lasted?", "Any breathing difficulty?", "Any chest pain?", "Is there fever along with it?"],
    hi: ["खांसी कितने समय से है?", "साँस में तकलीफ है?", "छाती में दर्द है?", "साथ में बुखार भी है?"],
  },
  pain: {
    en: ["Where exactly is the pain?", "How severe is it (mild/moderate/severe)?", "Was there any injury?", "How long has it lasted?", "Any numbness or warning signs?"],
    hi: ["दर्द ठीक कहाँ है?", "यह कितना गंभीर है (हल्का/मध्यम/गंभीर)?", "कोई चोट लगी थी?", "यह कितने समय से है?", "कोई सुन्नपन या चेतावनी संकेत?"],
  },
  stomach: {
    en: ["Any vomiting?", "Any diarrhea?", "Any blood in stool or vomit?", "Are you able to stay hydrated?", "Where is the pain located?"],
    hi: ["उल्टी हो रही है?", "दस्त हैं?", "मल या उल्टी में खून है?", "क्या आप हाइड्रेटेड रह पा रहे हैं?", "दर्द कहाँ स्थित है?"],
  },
  weakness: {
    en: ["How long have you felt weak?", "Any dizziness or fainting?", "Any fever?", "How is your sleep?", "How is your appetite and nutrition?"],
    hi: ["कब से कमज़ोरी महसूस हो रही है?", "चक्कर या बेहोशी आती है?", "कोई बुखार है?", "आपकी नींद कैसी है?", "भूख और पोषण कैसा है?"],
  },
  cough_cold: null,
  child: {
    en: ["Child's age?", "Any fever or reduced feeding?", "Is the child active and alert?", "Any breathing difficulty?"],
    hi: ["बच्चे की उम्र?", "बुखार या दूध/भोजन कम लेना?", "क्या बच्चा सक्रिय और सचेत है?", "साँस में तकलीफ है?"],
  },
  general: {
    en: ["What is the main reason for the check-up?", "Any ongoing symptoms?", "Any known conditions or medicines?"],
    hi: ["जाँच का मुख्य कारण क्या है?", "कोई चल रहे लक्षण?", "कोई ज्ञात रोग या दवाइयाँ?"],
  },
  other: {
    en: ["Can you describe the main concern?", "How long has it been going on?", "Any other symptoms?", "Any known conditions or medicines?"],
    hi: ["मुख्य समस्या बताएँ?", "यह कब से है?", "कोई और लक्षण?", "कोई ज्ञात रोग या दवाइयाँ?"],
  },
};

const PROBLEM_CATEGORY = [
  { match: ["fever", "बुखार"], cat: "fever" },
  { match: ["cough", "cold", "खांसी", "जुकाम", "throat", "खराश"], cat: "cough" },
  { match: ["pain", "headache", "दर्द", "सिरदर्द"], cat: "pain" },
  { match: ["stomach", "vomit", "diarr", "पेट", "उल्टी", "दस्त"], cat: "stomach" },
  { match: ["weak", "कमज़ोर"], cat: "weakness" },
];

export function categoryFor(problems, otherText) {
  const hay = [...(problems || []), otherText || ""].join(" ").toLowerCase();
  for (const row of PROBLEM_CATEGORY) {
    if (row.match.some((m) => hay.includes(m.toLowerCase()))) return row.cat;
  }
  return "other";
}

export function followupQuestions(category, lang) {
  const entry = FOLLOWUPS[category] || FOLLOWUPS.other;
  const list = entry?.[lang] || entry?.en || FOLLOWUPS.other[lang] || FOLLOWUPS.other.en;
  return list.map((q) => ({ question: q, answer: "" }));
}
