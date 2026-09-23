import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ShoppingCart, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { useCart } from "../context/CartContext";
import { formatUSD } from "../utils/format";

export function CartDrawer() {
  const { drawerOpen, setDrawerOpen, items, removeItem, subtotal } = useCart();
  const navigate = useNavigate();

  const goCheckout = () => {
    setDrawerOpen(false);
    navigate("/checkout");
  };

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col border-l border-border bg-card"
            data-testid="cart-slideover-drawer"
            role="dialog"
            aria-label="Carrinho de compras"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold uppercase tracking-wide">
                <ShoppingCart className="h-5 w-5 text-primary" /> Carrinho
              </h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Fechar carrinho"
                data-testid="cart-drawer-close"
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <ShoppingCart className="h-10 w-10 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">Seu carrinho está vazio.</p>
                  <Link
                    to="/products"
                    onClick={() => setDrawerOpen(false)}
                    className="font-mono text-xs uppercase tracking-widest text-primary hover:underline"
                  >
                    Explorar softwares
                  </Link>
                </div>
              ) : (
                <ul className="flex flex-col gap-4">
                  {items.map((item) => (
                    <motion.li
                      key={`${item.slug}-${item.tier}`}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      className="flex gap-4 rounded-lg border border-border/60 bg-secondary/30 p-3"
                    >
                      <img
                        src={item.image}
                        alt=""
                        loading="lazy"
                        className="h-16 w-16 rounded-md object-cover"
                      />
                      <div className="flex flex-1 flex-col">
                        <p className="text-sm font-semibold">{item.name}</p>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          Licença {item.tier === "enterprise" ? "Enterprise" : "Standard"}
                        </p>
                        <p className="mt-auto font-mono text-sm font-bold text-primary">{formatUSD(item.price)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.slug, item.tier)}
                        aria-label={`Remover ${item.name} do carrinho`}
                        data-testid={`cart-remove-${item.slug}`}
                        className="self-start rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-border px-6 py-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="font-display text-xl font-bold" data-testid="cart-drawer-subtotal">{formatUSD(subtotal)}</span>
                </div>
                <button
                  type="button"
                  onClick={goCheckout}
                  data-testid="cart-drawer-checkout-button"
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]"
                >
                  Finalizar compra <ArrowRight className="h-4 w-4" />
                </button>
                <Link
                  to="/cart"
                  onClick={() => setDrawerOpen(false)}
                  className="mt-2 block text-center font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
                >
                  Ver carrinho completo
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
