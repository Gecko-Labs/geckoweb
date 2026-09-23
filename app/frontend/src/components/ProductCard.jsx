import { Link } from "react-router-dom";
import { Check, ShoppingCart, Star } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { useCart } from "../context/CartContext";
import { formatUSD } from "../utils/format";

export function ProductCard({ product, owned = false, index = 0 }) {
  const { addItem, hasItem } = useCart();
  const inCart = hasItem(product.slug);

  const handleAdd = (e) => {
    e.preventDefault();
    addItem(product, "standard");
    toast.success(`${product.name} adicionado ao carrinho`);
  };

  return (
    <motion.article
      data-testid={`product-card-${product.slug}`}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: (index % 4) * 0.07, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5 }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card transition-[border-color,box-shadow] duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
    >
      <Link to={`/products/${product.slug}`} className="block" aria-label={`Ver detalhes de ${product.name}`}>
        <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
          <img
            src={product.image}
            alt={`Interface do ${product.name}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          <span className="absolute left-3 top-3 rounded-full border border-primary/30 bg-background/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-primary backdrop-blur-sm">
            {product.badge}
          </span>
          {owned && (
            <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
              <Check className="h-3 w-3" /> Adquirido
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">{product.category}</p>
        <Link to={`/products/${product.slug}`}>
          <h3 className="font-display text-xl font-bold leading-tight tracking-tight transition-colors group-hover:text-primary">
            {product.name}
          </h3>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">{product.tagline}</p>
        </Link>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{product.short_desc}</p>

        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {product.rating} <span className="text-muted-foreground/60">({product.reviews_count})</span>
            </div>
            <p className="mt-1 font-display text-2xl font-bold tracking-tight">
              {formatUSD(product.prices.standard)}
            </p>
          </div>
          {owned ? (
            <Link
              to="/account?tab=downloads"
              data-testid={`owned-button-${product.slug}`}
              className="rounded-md border border-primary/40 px-3.5 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              Downloads
            </Link>
          ) : inCart ? (
            <Link
              to="/cart"
              data-testid={`add-to-cart-button-${product.slug}`}
              className="rounded-md border border-primary/40 px-3.5 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              No carrinho →
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              data-testid={`add-to-cart-button-${product.slug}`}
              aria-label={`Adicionar ${product.name} ao carrinho`}
              className="flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 active:scale-95"
            >
              <ShoppingCart className="h-3.5 w-3.5" /> Adicionar
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
