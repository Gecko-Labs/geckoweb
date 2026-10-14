let moneyCfg = { currency: "BRL", usdPerBrl: 0.18 };
export const setMoneyConfig = (cfg) => { moneyCfg = { ...moneyCfg, ...cfg }; };

export function formatUSD(cents) {
  const brl = (cents ?? 0) / 100;
  return moneyCfg.currency === "USD"
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(brl * moneyCfg.usdPerBrl)
    : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(brl);
}

export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
