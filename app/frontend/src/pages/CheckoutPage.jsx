import { useState } from "react";
import { Link } from "react-router-dom";
import { CreditCard, Lock, ShieldCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { api, apiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useCurrency } from "../lib/currency";
import { useI18n } from "../context/I18nContext";
import { toCheckoutItem } from "../lib/products";
import { FadeIn } from "../components/Reveal";

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, promo } = useCart();
  const { format, currency } = useCurrency();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  // Verifica se todos os itens têm preços oficiais válidos para a moeda atual
  const hasValidPrices = items.every((item) => {
    const priceObj = item.priceObj ?? {};
    const priceForCurrency = priceObj[currency.toLowerCase()] ?? priceObj.brl ?? priceObj.usd;
    return priceForCurrency != null && priceForCurrency > 0;
  });

  // Calcula totais usando apenas preços oficiais (sem conversão cambial)
  const getItemPrice = (item) => {
    const priceObj = item.priceObj ?? {};
    return priceObj[currency.toLowerCase()] ?? priceObj.brl ?? priceObj.usd ?? 0;
  };

  const getSubtotal = () => items.reduce((sum, item) => sum + getItemPrice(item), 0);
  const getDiscount = () => promo ? Math.round((getSubtotal() * promo.percent) / 100) : 0;
  const getTotal = () => getSubtotal() - getDiscount();

  const handleCheckout = async () => {
    if (!hasValidPrices) {
      toast.error(t("checkout.priceUnavailable", "Preço indisponível para um ou mais itens. Verifique o catálogo."));
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/checkout/create-session", {
        items: items.map(toCheckoutItem),
        currency: currency.toLowerCase(),
        promo: promo?.code,
      });
      window.location.href = data.checkout_url ?? data.checkoutUrl;
    } catch (err) {
      toast.error(apiError(err, t("checkout.error", "Não foi possível iniciar o pagamento")));
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4" data-testid="checkout-empty">
        <p className="text-muted-foreground">{t("checkout.empty", "Seu carrinho está vazio.")}</p>
        <Link to="/products" className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
          {t("common.explore", "Explorar softwares")}
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 pb-24 pt-28 sm:px-6 lg:px-8" data-testid="checkout-page">
      <FadeIn>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">{t("checkout.title", "Checkout")}</p>
        <h1 className="mt-2 font-display text-4xl font-bold uppercase tracking-tight">{t("checkout.subtitle", "Finalizar pedido")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("checkout.buyingAs", "Comprando como")} <span className="font-mono text-foreground">{user?.email}</span> — {t("checkout.licensesLinked", "as licenças serão vinculadas a esta conta.")}
        </p>
      </FadeIn>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <FadeIn className="lg:col-span-7">
          <ul className="flex flex-col gap-4">
            {items.map((item) => (
              <li key={`${item.slug}-${item.tier}`} className="flex items-center gap-5 rounded-xl border border-border/70 bg-card p-4">
                <img src={item.image} alt="" loading="lazy" className="h-20 w-20 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="font-display text-lg font-bold tracking-tight">{item.name}</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {t(`checkout.tier.${item.tier}`, item.tier === "enterprise" ? "Enterprise Vault" : "Standard Seat")}
                  </p>
                </div>
                <p className="font-mono text-base font-bold text-primary">
                  {format(getItemPrice(item))}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { icon: Lock, label: t("checkout.security.encrypted", "Pagamento criptografado") },
              { icon: ShieldCheck, label: t("checkout.security.guarantee", "14 dias de garantia") },
              { icon: CreditCard, label: t("checkout.security.stripe", "Processado pela Stripe") },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/50 px-4 py-3">
                <Icon className="h-4 w-4 shrink-0 text-primary" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.1} className="lg:col-span-5">
          <div className="sticky top-24 rounded-xl border border-border/70 bg-card p-6">
            <h2 className="font-display text-xl font-bold uppercase tracking-tight">{t("checkout.payment", "Pagamento")}</h2>
            <dl className="mt-5 flex flex-col gap-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t("checkout.subtotal", "Subtotal")}</dt>
                <dd className="font-mono">{format(getSubtotal())}</dd>
              </div>
              {promo && (
                <div className="flex justify-between text-primary">
                  <dt>{t("checkout.coupon", "Cupom")} {promo.code}</dt>
                  <dd className="font-mono">-{format(getDiscount())}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-border/60 pt-4">
                <dt className="font-semibold">{t("checkout.total", "Total")}</dt>
                <dd className="font-display text-3xl font-black" data-testid="checkout-total">
                  {format(getTotal())}
                </dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={loading || !hasValidPrices}
              data-testid="checkout-submit-button"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-4 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:shadow-xl hover:shadow-primary/25 active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  {t("checkout.redirecting", "Redirecionando para a Stripe…")}
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" /> {t("checkout.payWithStripe", "Pagar com Stripe")}
                </>
              )}
            </button>
            
            {!hasValidPrices && (
              <p className="mt-3 text-center text-sm text-destructive" role="alert">
                <AlertCircle className="h-4 w-4 mx-auto mb-1" />
                {t("checkout.priceUnavailable", "Preço indisponível para um ou mais itens. Verifique o catálogo.")}
              </p>
            )}
            
            <p className="mt-4 text-center font-mono text-[10px] leading-relaxed tracking-wide text-muted-foreground">
              {t("checkout.secureNote", "Você será redirecionado para o checkout seguro da Stripe. Nenhum dado de cartão passa pelos nossos servidores.")}
            </p>
          </div>
        </FadeIn>
      </div>
    </main>
  );
}
