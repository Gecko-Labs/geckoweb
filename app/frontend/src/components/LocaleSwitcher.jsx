
import { Languages } from "lucide-react";

import { useI18n } from "../context/I18nContext";
import { useCurrency } from "../context/CurrencyContext";

export function LocaleSwitcher() {
  const { locale, setLocale } = useI18n();
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="flex items-center gap-1.5">
      <Languages
        className="hidden h-4 w-4 text-muted-foreground sm:block"
        aria-hidden="true"
      />

      <label htmlFor="locale-select" className="sr-only">
        Idioma
      </label>

      <select
        id="locale-select"
        aria-label="Selecionar idioma"
        value={locale}
        onChange={(event) => setLocale(event.target.value)}
        className="h-9 max-w-[88px] rounded-md border border-border/70 bg-background px-1.5 text-xs text-foreground outline-none transition-colors hover:border-primary/50 focus:border-primary"
      >
        <option value="pt-BR">PT-BR</option>
        <option value="en-US">EN-US</option>
      </select>

      <label htmlFor="currency-select" className="sr-only">
        Moeda
      </label>

      <select
        id="currency-select"
        aria-label="Selecionar moeda"
        value={currency}
        onChange={(event) => setCurrency(event.target.value)}
        className="h-9 max-w-[76px] rounded-md border border-border/70 bg-background px-1.5 text-xs text-foreground outline-none transition-colors hover:border-primary/50 focus:border-primary"
      >
        <option value="BRL">BRL</option>
        <option value="USD">USD</option>
      </select>
    </div>
  );
}
