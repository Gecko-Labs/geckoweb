import { createContext, useContext, useEffect, useState, useCallback, Fragment } from "react";
import { api } from "./api";
import { useI18n } from "./i18n";

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const { lang } = useI18n();
  const [currency, setCurrencyState] = useState(
    () => localStorage.getItem("gecko_currency") || (lang === "pt" ? "BRL" : "USD")
  );
  // Taxa de câmbio USD por BRL. Valor inicial neutro até a API responder.
  const [usdPerBrl, setUsdPerBrl] = useState(null);
  const [ratesLoaded, setRatesLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.get("/currency/rates")
      .then(({ data }) => {
        if (!cancelled && data?.usd != null) {
          setUsdPerBrl(Number(data.usd));
        }
        setRatesLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setRatesLoaded(true);
      });
    return () => { cancelled = true; };
  }, []);

  const setCurrency = useCallback((c) => {
    localStorage.setItem("gecko_currency", c);
    setCurrencyState(c);
  }, []);

  // recebe o valor em BRL (como vem da API, em centavos) e formata na moeda escolhida
  const format = useCallback(
    (brlCents) => {
      const brl = (brlCents ?? 0) / 100;
      if (currency === "USD") {
        const rate = usdPerBrl ?? 0;
        return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(brl * rate);
      }
      return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(brl);
    },
    [currency, usdPerBrl]
  );

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format, usdPerBrl, ratesLoaded }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
export function MoneyBoundary({ children }) {
  const { currency, usdPerBrl } = useCurrency();
  return <Fragment key={`${currency}-${usdPerBrl}`}>{children}</Fragment>;
}