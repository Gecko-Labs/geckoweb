export function formatUSD(cents, rate = null) {
  const brl = (cents ?? 0) / 100;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(brl);
}

export function formatUSDFromBrlCents(cents, usdPerBrl) {
  const brl = (cents ?? 0) / 100;
  const rate = usdPerBrl ?? 0;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(brl * rate);
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
