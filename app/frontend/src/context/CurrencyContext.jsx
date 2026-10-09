import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useI18n } from "./I18nContext";

const CurrencyContext = createContext(null);

const SUPPORTED_CURRENCIES = ["BRL", "USD"];

function getInitialCurrency(locale) {
  try {
    const savedCurrency = localStorage.getItem("gecko-currency");

    if (SUPPORTED_CURRENCIES.includes(savedCurrency)) {
      return savedCurrency;
    }
  } catch {
    // localStorage indisponível
  }

  return locale === "en-US" ? "USD" : "BRL";
}

export function CurrencyProvider({ children }) {
  const { locale } = useI18n();

  const [currency, setCurrencyState] = useState(() =>
    getInitialCurrency(locale)
  );

  const setCurrency = useCallback((nextCurrency) => {
    const normalizedCurrency = nextCurrency?.toUpperCase();

    if (!SUPPORTED_CURRENCIES.includes(normalizedCurrency)) {
      return;
    }

    setCurrencyState(normalizedCurrency);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("gecko-currency", currency);
    } catch {
      // localStorage indisponível
    }
  }, [currency]);

  const formatPrice = useCallback(
    (amount, options = {}) => {
      const value = Number(amount);

      if (!Number.isFinite(value)) {
        return "";
      }

      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        ...options,
      }).format(value);
    },
    [locale, currency]
  );

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      formatPrice,
    }),
    [currency, setCurrency, formatPrice]
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);

  if (!context) {
    throw new Error(
      "useCurrency deve ser usado dentro de CurrencyProvider."
    );
  }

  return context;
}