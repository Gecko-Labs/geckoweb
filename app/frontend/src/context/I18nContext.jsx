
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const I18nContext = createContext(null);

const SUPPORTED_LOCALES = ["pt-BR", "en-US"];

function getInitialLocale() {
  try {
    const savedLocale = localStorage.getItem("gecko-locale");

    if (SUPPORTED_LOCALES.includes(savedLocale)) {
      return savedLocale;
    }
  } catch {
    // localStorage indisponível
  }

  return "pt-BR";
}

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(getInitialLocale);

  const setLocale = useCallback((nextLocale) => {
    if (!SUPPORTED_LOCALES.includes(nextLocale)) {
      return;
    }

    setLocaleState(nextLocale);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("gecko-locale", locale);
    } catch {
      // localStorage indisponível
    }

    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      language: locale,
    }),
    [locale, setLocale]
  );

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n deve ser usado dentro de I18nProvider.");
  }

  return context;
}
