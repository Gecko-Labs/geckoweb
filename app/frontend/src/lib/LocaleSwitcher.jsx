import { useI18n } from "../lib/i18n";
import { useCurrency } from "../lib/currency";

const pill = (active) =>
  `px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
    active ? "bg-emerald-500 text-black" : "text-gray-400 hover:text-white"
  }`;

export default function LocaleSwitcher() {
  const { lang, setLang } = useI18n();
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="flex items-center gap-2">
      <div className="flex rounded-md border border-white/10 p-0.5">
        <button className={pill(lang === "pt")} onClick={() => setLang("pt")}>PT</button>
        <button className={pill(lang === "en")} onClick={() => setLang("en")}>EN</button>
      </div>
      <div className="flex rounded-md border border-white/10 p-0.5">
        <button className={pill(currency === "BRL")} onClick={() => setCurrency("BRL")}>R$</button>
        <button className={pill(currency === "USD")} onClick={() => setCurrency("USD")}>US$</button>
      </div>
    </div>
  );
}