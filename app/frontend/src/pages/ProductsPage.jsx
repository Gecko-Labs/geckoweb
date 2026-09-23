import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";

import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { ProductCard } from "../components/ProductCard";
import { SectionHeading } from "../components/SectionHeading";
import { Skeleton } from "../components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

const PRICE_RANGES = [
  { value: "all", label: "Qualquer preço" },
  { value: "under-100", label: "Até US$ 100" },
  { value: "100-200", label: "US$ 100 – 200" },
  { value: "over-200", label: "Acima de US$ 200" },
];

function inRange(priceCents, range) {
  const v = priceCents / 100;
  if (range === "under-100") return v < 100;
  if (range === "100-200") return v >= 100 && v <= 200;
  if (range === "over-200") return v > 200;
  return true;
}

export default function ProductsPage() {
  const [products, setProducts] = useState(null);
  const [ownedSlugs, setOwnedSlugs] = useState([]);
  const [search, setSearch] = useState("");
  const [params, setParams] = useSearchParams();
  const category = params.get("categoria") || "all";
  const [priceRange, setPriceRange] = useState("all");
  const [sort, setSort] = useState("featured");
  const { user } = useAuth();

  useEffect(() => {
    api.get("/products").then(({ data }) => setProducts(data)).catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    if (!user) return setOwnedSlugs([]);
    api.get("/licenses").then(({ data }) => {
      setOwnedSlugs(data.filter((l) => l.status === "active").map((l) => l.product_slug));
    }).catch(() => {});
  }, [user]);

  const categories = useMemo(() => {
    if (!products) return [];
    return [...new Set(products.map((p) => p.category))];
  }, [products]);

  const filtered = useMemo(() => {
    if (!products) return [];
    const q = search.trim().toLowerCase();
    let list = products.filter(
      (p) =>
        (category === "all" || p.category === category) &&
        inRange(p.prices.standard, priceRange) &&
        (!q ||
          p.name.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))),
    );
    if (sort === "price-asc") list = [...list].sort((a, b) => a.prices.standard - b.prices.standard);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.prices.standard - a.prices.standard);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === "featured") list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
    return list;
  }, [products, search, category, priceRange, sort]);

  const setCategory = (c) => {
    if (c === "all") params.delete("categoria");
    else params.set("categoria", c);
    setParams(params, { replace: true });
  };

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:px-8" data-testid="products-page">
      <SectionHeading
        chapter="Catálogo // Softwares"
        title="Ferramentas de engenharia de precisão"
        description="Cada produto é versionado, assinado e entregue com licença criptográfica na hora."
      />

      <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, tag ou tecnologia…"
            aria-label="Buscar produtos"
            data-testid="product-catalog-search-input"
            className="h-11 w-full rounded-md border border-input bg-card pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/50"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger className="w-44" data-testid="filter-price" aria-label="Filtrar por preço">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRICE_RANGES.map((r) => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-44" data-testid="filter-sort" aria-label="Ordenar produtos">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Destaques</SelectItem>
              <SelectItem value="rating">Melhor avaliados</SelectItem>
              <SelectItem value="price-asc">Menor preço</SelectItem>
              <SelectItem value="price-desc">Maior preço</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Categorias">
        {["all", ...categories].map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={category === c}
            onClick={() => setCategory(c)}
            data-testid={`filter-category-${c === "all" ? "all" : c.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
            className={`rounded-full border px-4 py-1.5 font-mono text-xs tracking-wide transition-all duration-200 ${
              category === c
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {c === "all" ? "Todos" : c}
          </button>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" data-testid="products-grid">
        {products === null
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-xl" data-testid="product-skeleton" />
            ))
          : filtered.map((p, i) => (
              <ProductCard key={p.slug} product={p} owned={ownedSlugs.includes(p.slug)} index={i} />
            ))}
      </div>

      {products !== null && filtered.length === 0 && (
        <div className="mt-16 rounded-xl border border-dashed border-border py-16 text-center" data-testid="products-empty">
          <p className="text-sm text-muted-foreground">Nenhum produto encontrado para esses filtros.</p>
        </div>
      )}
    </main>
  );
}
