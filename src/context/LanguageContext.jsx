import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { DICT } from "@/i18n";

const LanguageContext = createContext(null);
const STORAGE_KEY = "ayucore_lang";

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === "hi" || saved === "en" ? saved : "en";
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      console.warn("Could not persist language preference:", e);
    }
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l) => setLangState(l === "hi" ? "hi" : "en"), []);
  const toggle = useCallback(() => setLangState((l) => (l === "en" ? "hi" : "en")), []);
  const t = useCallback(
    (key) => DICT[lang]?.[key] ?? DICT.en[key] ?? key,
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
