import { useState } from "react";
import { Link } from "react-router-dom";
import { CreditCard, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { api, apiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatUSD } from "../utils/format";
import { FadeIn } from "../components/Reveal";

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, subtotal, discount, total, promo } = useCart();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/checkout", {
        items: items.map((i) => ({ slug: i.slug, tier: i.tier })),
        promo_code: promo?.code || null,
        origin_url: window.location.origin,
      });
      window.location.href = data.checkout_url;
    } catch (err) {
      toast.error(apiError(err, "Não foi possível iniciar o pagamento"));
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4" data-testid="checkout-empty">
        <p className="text-muted-foreground">Seu carrinho está vazio.</p>
        <Link to="/products" className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
          Explorar softwares
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 pb-24 pt-28 sm:px-6 lg:px-8" data-testid="checkout-page">
      <FadeIn>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Checkout</p>
        <h1 className="mt-2 font-display text-4xl font-bold uppercase tracking-tight">Finalizar pedido</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Comprando como <span className="font-mono text-foreground">{user?.email}</span> — as licenças serão vinculadas a esta conta.
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
                    Licença {item.tier === "enterprise" ? "Enterprise Vault" : "Standard Seat"}
                  </p>
                </div>
                <p className="font-mono text-base font-bold text-primary">{formatUSD(item.price)}</p>
              </li>
            ))}
          </ul>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { icon: Lock, label: "Pagamento criptografado" },
              { icon: ShieldCheck, label: "14 dias de garantia" },
              { icon: CreditCard, label: "Processado pela Stripe" },
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
            <h2 className="font-display text-xl font-bold uppercase tracking-tight">Pagamento</h2>
            <dl className="mt-5 flex flex-col gap-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-mono">{formatUSD(subtotal)}</dd>
              </div>
              {promo && (
                <div className="flex justify-between text-primary">
                  <dt>Cupom {promo.code}</dt>
                  <dd className="font-mono">−{formatUSD(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-border/60 pt-4">
                <dt className="font-semibold">Total</dt>
                <dd className="font-display text-3xl font-black" data-testid="checkout-total">{formatUSD(total)}</dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={loading}
              data-testid="checkout-submit-button"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-4 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:shadow-xl hover:shadow-primary/25 active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Redirecionando para a Stripe…
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" /> Pagar com Stripe
                </>
              )}
            </button>
            <p className="mt-4 text-center font-mono text-[10px] leading-relaxed tracking-wide text-muted-foreground">
              Você será redirecionado para o checkout seguro da Stripe. Nenhum dado de cartão passa pelos nossos servidores.
            </p>
          </div>
        </FadeIn>
      </div>
    </main>
  );
}
