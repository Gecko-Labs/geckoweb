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

  // Formata um valor já expresso na moeda selecionada (recebe centavos).
  // Não realiza conversão cambial: o valor deve vir já convertido ou ser o preço oficial da moeda.
  const format = useCallback(
    (cents) => {
      const value = (cents ?? 0) / 100;
      if (currency === "USD") {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
      }
      return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
    },
    [currency]
  );

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        format,
        usdPerBrl,
        ratesLoaded,
        // Converte centavos BRL para USD usando a taxa de câmbio. Usar apenas como fallback
        // quando o produto não tiver preço oficial em USD. Retorna null se a taxa não estiver disponível.
        formatConverted: useCallback(
          (brlCents) => {
            if (!ratesLoaded || usdPerBrl == null) return null;
            const brl = (brlCents ?? 0) / 100;
            return new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(brl * usdPerBrl);
          },
          [usdPerBrl, ratesLoaded]
        ),
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
export function MoneyBoundary({ children }) {
  const { currency, usdPerBrl } = useCurrency();
  return <Fragment key={`${currency}-${usdPerBrl}`}>{children}</Fragment>;
}