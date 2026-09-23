import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Check, Copy, ShieldCheck, ShoppingCart, Star, Terminal } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatUSD } from "../utils/format";
import { FadeIn } from "../components/Reveal";
import { Skeleton } from "../components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";

const TIERS = [
  { id: "standard", name: "Standard Seat", desc: "1 desenvolvedor · 3 ativações" },
  { id: "enterprise", name: "Enterprise Vault", desc: "Site ilimitado · air-gap · SLA 24h" },
];

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem, hasItem } = useCart();
  const [product, setProduct] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [tier, setTier] = useState("standard");
  const [activeImage, setActiveImage] = useState(0);
  const [owned, setOwned] = useState(false);

  useEffect(() => {
    setProduct(null);
    setNotFound(false);
    setActiveImage(0);
    api.get(`/products/${slug}`).then(({ data }) => setProduct(data)).catch(() => setNotFound(true));
  }, [slug]);

  useEffect(() => {
    if (!user || !product) return setOwned(false);
    api.get("/licenses").then(({ data }) => {
      setOwned(data.some((l) => l.product_slug === product.slug && l.status === "active"));
    }).catch(() => {});
  }, [user, product]);

  if (notFound) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4" data-testid="product-not-found">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">404 // NOT FOUND</p>
        <h1 className="font-display text-4xl font-bold uppercase">Produto não encontrado</h1>
        <Link to="/products" className="mt-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
          Voltar ao catálogo
        </Link>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
        <Skeleton className="h-[420px] w-full rounded-xl" />
      </main>
    );
  }

  const inCart = hasItem(product.slug);
  const price = product.prices[tier];

  const handleAdd = () => {
    addItem(product, tier);
    toast.success(`${product.name} (${tier === "enterprise" ? "Enterprise" : "Standard"}) no carrinho`);
  };

  const handleBuyNow = () => {
    addItem(product, tier);
    navigate("/checkout");
  };

  const copyInstall = () => {
    navigator.clipboard?.writeText(`curl -fsSL https://dl.geckolabs.dev/${product.slug}/install.sh | sh`);
    toast.success("Comando copiado");
  };

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 pb-24 pt-24 sm:px-6 lg:px-8" data-testid="product-detail-page">
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 font-mono text-xs text-muted-foreground">
        <Link to="/" className="transition-colors hover:text-primary">Início</Link>
        <span aria-hidden="true">/</span>
        <Link to="/products" className="transition-colors hover:text-primary">Produtos</Link>
        <span aria-hidden="true">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Gallery */}
        <div className="lg:col-span-7">
          <FadeIn>
            <div className="relative overflow-hidden rounded-xl border border-border/70 bg-secondary">
              <motion.img
                key={activeImage}
                src={product.gallery[activeImage]}
                alt={`Screenshot ${activeImage + 1} do ${product.name}`}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="aspect-[16/10] w-full object-cover"
                data-testid="product-gallery-main"
              />
              <span className="absolute left-4 top-4 rounded-full border border-primary/30 bg-background/70 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-primary backdrop-blur-sm">
                {product.badge}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {product.gallery.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-label={`Ver screenshot ${i + 1}`}
                  data-testid={`product-gallery-thumb-${i}`}
                  className={`overflow-hidden rounded-lg border transition-all duration-200 ${
                    activeImage === i ? "border-primary shadow-lg shadow-primary/10" : "border-border/60 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={src} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover" />
                </button>
              ))}
            </div>
          </FadeIn>
        </div>

        {/* Purchase console */}
        <FadeIn delay={0.1} className="lg:col-span-5">
          <div className="sticky top-24 rounded-xl border border-border/70 bg-card p-7" data-testid="purchase-console">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary">{product.category}</p>
            <h1 className="mt-2 font-display text-3xl font-bold uppercase leading-none tracking-tight sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-1 font-mono text-xs text-muted-foreground">{product.tagline}</p>

            <div className="mt-4 flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {product.rating} · {product.reviews_count} avaliações
              </span>
              <span className="rounded border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                {product.version}
              </span>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

            <fieldset className="mt-6">
              <legend className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Tipo de licença
              </legend>
              <div className="grid grid-cols-1 gap-2.5">
                {TIERS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTier(t.id)}
                    aria-pressed={tier === t.id}
                    data-testid={`license-tier-${t.id}`}
                    className={`flex items-center justify-between rounded-lg border px-4 py-3.5 text-left transition-all duration-200 ${
                      tier === t.id
                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/5"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <span>
                      <span className="block text-sm font-semibold">{t.name}</span>
                      <span className="block font-mono text-[10px] text-muted-foreground">{t.desc}</span>
                    </span>
                    <span className="font-mono text-sm font-bold text-primary">{formatUSD(product.prices[t.id])}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-6 flex items-end justify-between border-t border-border/60 pt-5">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-display text-4xl font-black tracking-tight" data-testid="product-price">{formatUSD(price)}</span>
            </div>

            {owned ? (
              <div className="mt-5 rounded-lg border border-primary/30 bg-primary/10 p-4 text-center">
                <p className="flex items-center justify-center gap-2 text-sm font-semibold text-primary" data-testid="product-owned-badge">
                  <ShieldCheck className="h-4 w-4" /> Licença ativa na sua conta
                </p>
                <Link
                  to="/account?tab=downloads"
                  className="mt-3 inline-block rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/25"
                >
                  Ir para downloads
                </Link>
              </div>
            ) : (
              <div className="mt-5 flex gap-3">
                {inCart ? (
                  <Link
                    to="/cart"
                    data-testid="product-in-cart-button"
                    className="flex flex-1 items-center justify-center gap-2 rounded-md border border-primary/40 px-4 py-3.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
                  >
                    <Check className="h-4 w-4" /> No carrinho
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handleAdd}
                    data-testid="product-add-to-cart"
                    className="flex flex-1 items-center justify-center gap-2 rounded-md border border-primary/40 px-4 py-3.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 active:scale-[0.98]"
                  >
                    <ShoppingCart className="h-4 w-4" /> Adicionar
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleBuyNow}
                  data-testid="product-buy-now"
                  className="flex-1 rounded-md bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:shadow-xl hover:shadow-primary/25 active:scale-[0.98]"
                >
                  Comprar agora
                </button>
              </div>
            )}

            <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              14 dias de garantia · licença emitida na hora
            </p>
          </div>
        </FadeIn>
      </div>

      {/* Details */}
      <div className="mt-20 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <FadeIn>
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight">Recursos</h2>
            <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {product.features.map((f) => (
                <li key={f} className="flex items-start gap-3 rounded-lg border border-border/60 bg-card p-4 text-sm text-muted-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
          </FadeIn>

          <FadeIn className="mt-12">
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight">Instalação</h2>
            <button
              type="button"
              onClick={copyInstall}
              data-testid="product-copy-install"
              className="group mt-5 flex w-full items-center gap-3 rounded-lg border border-border bg-card px-5 py-4 text-left font-mono text-sm text-muted-foreground transition-colors hover:border-primary/40"
            >
              <Terminal className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate">curl -fsSL https://dl.geckolabs.dev/{product.slug}/install.sh | sh</span>
              <Copy className="ml-auto h-4 w-4 shrink-0 transition-colors group-hover:text-primary" />
            </button>
          </FadeIn>

          <FadeIn className="mt-12">
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight">Perguntas frequentes</h2>
            <Accordion type="single" collapsible className="mt-4" data-testid="product-faq">
              {product.faq.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger data-testid={`faq-trigger-${i}`} className="text-left text-sm font-medium">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </FadeIn>
        </div>

        <div className="lg:col-span-5">
          <FadeIn>
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight">Especificações</h2>
            <dl className="mt-6 overflow-hidden rounded-xl border border-border/70">
              {[
                ["Sistemas", product.requirements.os],
                ["Memória", product.requirements.memory],
                ["Runtime", product.requirements.runtime],
                ["Dependências", product.requirements.deps],
              ].map(([k, v], i) => (
                <div key={k} className={`flex justify-between gap-4 px-5 py-4 ${i % 2 === 0 ? "bg-card" : "bg-secondary/30"}`}>
                  <dt className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{k}</dt>
                  <dd className="text-right font-mono text-xs font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </FadeIn>

          <FadeIn delay={0.1} className="mt-8">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Compatibilidade</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.compatibility.map((c) => (
                <span key={c} className="rounded-full border border-border bg-card px-3 py-1.5 font-mono text-xs text-muted-foreground">
                  {c}
                </span>
              ))}
            </div>
            <h3 className="mt-6 font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Stack</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.tags.map((t) => (
                <span key={t} className="rounded-full border border-primary/25 bg-primary/5 px-3 py-1.5 font-mono text-xs text-primary">
                  {t}
                </span>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </main>
  );
}
