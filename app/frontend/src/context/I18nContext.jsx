
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import translations from "../i18n/translations";

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

function getTranslation(dictionary, path) {
  return path.split(".").reduce((current, key) => {
    if (
      current !== null &&
      typeof current === "object" &&
      Object.prototype.hasOwnProperty.call(current, key)
    ) {
      return current[key];
    }

    return undefined;
  }, dictionary);
}

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(getInitialLocale);

  const setLocale = useCallback((nextLocale) => {
    if (!SUPPORTED_LOCALES.includes(nextLocale)) {
      return;
    }

    setLocaleState(nextLocale);
  }, []);

  const t = useCallback(
    (key, fallback) => {
      const dictionary = translations[locale];
      const translation = getTranslation(dictionary, key);

      if (typeof translation === "string") {
        return translation;
      }

      if (typeof fallback === "string") {
        return fallback;
      }

      // Exibe a chave para facilitar a identificação
      // de traduções que ainda não foram cadastradas.
      return key;
    },
    [locale]
  );

  useEffect(() => {
    try {
      localStorage.setItem("gecko-locale", locale);
    } catch {
      // localStorage indisponível
    }

    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      language: locale,
      setLocale,
      t,
    }),
    [locale, setLocale, t]
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
    throw new Error(
      "useI18n deve ser usado dentro de I18nProvider."
    );
  }

  return context;
}
