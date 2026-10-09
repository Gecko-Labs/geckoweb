import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "./api";
import { useI18n } from "./i18n";

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const { lang } = useI18n();
  const [currency, setCurrencyState] = useState(
    () => localStorage.getItem("gecko_currency") || (lang === "pt" ? "BRL" : "USD")
  );
  const [usdPerBrl, setUsdPerBrl] = useState(0.18);

  useEffect(() => {
    api.get("/currency/rates").then(({ data }) => data?.usd && setUsdPerBrl(data.usd)).catch(() => {});
  }, []);

  const setCurrency = useCallback((c) => {
    localStorage.setItem("gecko_currency", c);
    setCurrencyState(c);
  }, []);

  // recebe o valor em BRL (como vem da API) e formata na moeda escolhida
  const format = useCallback(
    (brl) =>
      currency === "USD"
        ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(brl * usdPerBrl)
        : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(brl),
    [currency, usdPerBrl]
  );

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);