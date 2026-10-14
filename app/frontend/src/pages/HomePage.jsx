
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Code2, ShieldCheck, Zap } from "lucide-react";

import { useI18n } from "../context/I18nContext";
import { api } from "../lib/api";
import { ProductCard } from "../components/ProductCard";

export default function HomePage() {
  const { t } = useI18n();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api
      .get("/products")
      .then(({ data }) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]));
  }, []);

  const featured = products.filter((product) => product.featured).slice(0, 3);

  const features = [
    {
      icon: Zap,
      title: t("home.features.fast.title", "Rápido"),
      text: t(
        "home.features.fast.description",
        "Ferramentas focadas em fluxo de trabalho."
      ),
    },
    {
      icon: ShieldCheck,
      title: t("home.features.licensed.title", "Licenciado"),
      text: t(
        "home.features.licensed.description",
        "Entrega e gerenciamento de licenças."
      ),
    },
    {
      icon: Code2,
      title: t("home.features.professional.title", "Profissional"),
      text: t(
        "home.features.professional.description",
        "Software desenvolvido para produção real."
      ),
    },
  ];

  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
            GECKO LABS // SOFTWARE
          </p>

          <h1 className="mt-5 text-5xl font-bold tracking-tight sm:text-7xl">
            {t("home.hero.title", "Software construído para criar mais.")}
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            {t(
              "home.hero.description",
              "Ferramentas profissionais, licenças digitais e produtos desenvolvidos pela Gecko Labs."
            )}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
            >
              {t("home.hero.productsButton", "Ver softwares")}
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/support"
              className="rounded-md border px-5 py-3 text-sm font-medium"
            >
              {t("home.hero.supportButton", "Suporte")}
            </Link>
          </div>
        </div>

        <div className="mt-20 grid gap-4 md:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-xl border p-6">
              <Icon className="h-5 w-5 text-primary" />
              <h2 className="mt-4 font-semibold">{title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="font-mono text-xs text-primary">
                {t("home.featured.eyebrow", "CATÁLOGO")}
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                {t("home.featured.title", "Produtos em destaque")}
              </h2>
            </div>

            <Link to="/products" className="text-sm text-primary">
              {t("home.featured.viewAll", "Ver todos")}
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product, index) => (
              <ProductCard
                key={product.slug}
                product={product}
                index={index}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
