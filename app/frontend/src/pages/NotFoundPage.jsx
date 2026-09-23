import { Link } from "react-router-dom";

import { GeckoMark } from "../components/GeckoMark";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 px-4 text-center" data-testid="not-found-page">
      <GeckoMark className="h-24 w-24 object-contain opacity-60" />
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">404 // Rota não compilada</p>
      <h1 className="font-display text-5xl font-black uppercase tracking-tight">Página não encontrada</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        O endereço que você acessou não existe ou foi movido.
      </p>
      <Link
        to="/"
        data-testid="not-found-home-link"
        className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/25"
      >
        Voltar ao início
      </Link>
    </main>
  );
}
