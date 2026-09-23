import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ShoppingCart, Tag, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { api, apiError } from "../lib/api";
import { useCart } from "../context/CartContext";
import { formatUSD } from "../utils/format";
import { FadeIn } from "../components/Reveal";

export default function CartPage() {
  const { items, removeItem, subtotal, discount, total, promo, setPromo } = useCart();
  const [code, setCode] = useState(promo?.code || "");
  const [validating, setValidating] = useState(false);
  const navigate = useNavigate();

  const applyPromo = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setValidating(true);
    try {
      const { data } = await api.post("/checkout/validate-promo", { code });
      setPromo(data);
      toast.success(`Cupom ${data.code} aplicado: ${data.percent}% de desconto`);
    } catch (err) {
      setPromo(null);
      toast.error(apiError(err, "Cupom inválido"));
    } finally {
      setValidating(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 pb-24 pt-28 sm:px-6 lg:px-8" data-testid="cart-page">
      <FadeIn>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Carrinho</p>
        <h1 className="mt-2 font-display text-4xl font-bold uppercase tracking-tight">Sua seleção</h1>
      </FadeIn>

      {items.length === 0 ? (
        <FadeIn delay={0.1} className="mt-14 flex flex-col items-center gap-4 rounded-xl border border-dashed border-border py-20 text-center">
          <ShoppingCart className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-muted-foreground">Seu carrinho está vazio.</p>
          <Link
            to="/products"
            data-testid="cart-empty-cta"
            className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/25"
          >
            Explorar softwares
          </Link>
        </FadeIn>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <ul className="flex flex-col gap-4 lg:col-span-7">
            {items.map((item) => (
              <FadeIn key={`${item.slug}-${item.tier}`}>
                <li className="flex gap-5 rounded-xl border border-border/70 bg-card p-4" data-testid={`cart-item-${item.slug}`}>
                  <img src={item.image} alt="" loading="lazy" className="h-24 w-24 rounded-lg object-cover" />
                  <div className="flex flex-1 flex-col">
                    <Link to={`/products/${item.slug}`} className="font-display text-lg font-bold tracking-tight transition-colors hover:text-primary">
                      {item.name}
                    </Link>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Licença {item.tier === "enterprise" ? "Enterprise Vault" : "Standard Seat"}
                    </p>
                    <p className="mt-auto font-mono text-base font-bold text-primary">{formatUSD(item.price)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.slug, item.tier)}
                    aria-label={`Remover ${item.name}`}
                    data-testid={`cart-page-remove-${item.slug}`}
                    className="self-start rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              </FadeIn>
            ))}
          </ul>

          <FadeIn delay={0.1} className="lg:col-span-5">
            <div className="sticky top-24 rounded-xl border border-border/70 bg-card p-6">
              <h2 className="font-display text-xl font-bold uppercase tracking-tight">Resumo</h2>

              <form onSubmit={applyPromo} className="mt-5 flex gap-2">
                <div className="relative flex-1">
                  <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Cupom (ex: GECKO-LAUNCH-20)"
                    aria-label="Código de cupom"
                    data-testid="promo-code-input"
                    className="h-11 w-full rounded-md border border-input bg-background pl-10 pr-3 font-mono text-xs uppercase tracking-wider outline-none transition-colors placeholder:normal-case placeholder:tracking-normal placeholder:text-muted-foreground/60 focus:border-primary/50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={validating}
                  data-testid="promo-apply-button"
                  className="rounded-md border border-primary/40 px-4 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
                >
                  {validating ? "…" : "Aplicar"}
                </button>
              </form>

              <dl className="mt-6 flex flex-col gap-3 border-t border-border/60 pt-5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-mono" data-testid="cart-subtotal">{formatUSD(subtotal)}</dd>
                </div>
                {promo && (
                  <div className="flex justify-between text-primary">
                    <dt>Cupom {promo.code} (−{promo.percent}%)</dt>
                    <dd className="font-mono" data-testid="cart-discount">−{formatUSD(discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-border/60 pt-4">
                  <dt className="font-semibold">Total</dt>
                  <dd className="font-display text-3xl font-black" data-testid="cart-total">{formatUSD(total)}</dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={() => navigate("/checkout")}
                data-testid="cart-checkout-button"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:shadow-xl hover:shadow-primary/25 active:scale-[0.98]"
              >
                Ir para o checkout <ArrowRight className="h-4 w-4" />
              </button>
              <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Pagamento seguro via Stripe
              </p>
            </div>
          </FadeIn>
        </div>
      )}
    </main>
  );
}
