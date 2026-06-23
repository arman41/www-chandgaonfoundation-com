import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "bn" | "en";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (bn: string, en: string) => string;
};

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("bn");

  useEffect(() => {
    try {
      const saved = (localStorage.getItem("cf-lang") as Lang | null);
      if (saved === "bn" || saved === "en") setLangState(saved);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      document.documentElement.lang = lang === "bn" ? "bn" : "en";
    } catch {}
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("cf-lang", l); } catch {}
  }, []);

  const t = useCallback((bn: string, en: string) => (lang === "bn" ? bn : en), [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): Ctx {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Fallback when used outside provider (SSR/safety)
    return {
      lang: "bn",
      setLang: () => {},
      t: (bn) => bn,
    };
  }
  return ctx;
}
