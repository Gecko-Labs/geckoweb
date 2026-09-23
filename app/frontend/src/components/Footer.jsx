import { Link } from "react-router-dom";
import { Github, Linkedin, Twitter } from "lucide-react";

import { GeckoMark } from "./GeckoMark";

const COLUMNS = [
  {
    title: "Produtos",
    links: [
      { label: "Catálogo completo", to: "/products" },
      { label: "GeckoTrace Ultra", to: "/products/gecko-trace-ultra" },
      { label: "PolyVault HSM", to: "/products/poly-vault-crypto" },
      { label: "GeckoLens AI", to: "/products/gecko-lens-ide" },
    ],
  },
  {
    title: "Suporte",
    links: [
      { label: "Central de suporte", to: "/support" },
      { label: "Status dos sistemas", to: "/support" },
      { label: "Reembolsos", to: "/terms#reembolso" },
    ],
  },
  {
    title: "Conta",
    links: [
      { label: "Entrar", to: "/login" },
      { label: "Criar conta", to: "/register" },
      { label: "Licenças e downloads", to: "/account" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Termos de uso", to: "/terms" },
      { label: "Privacidade (LGPD)", to: "/privacy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/40" data-testid="site-footer">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          <div className="col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <GeckoMark className="h-10 w-10 object-contain" />
              <div className="leading-none">
                <p className="font-display text-lg font-bold uppercase tracking-[0.14em]">Gecko Labs</p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.28em] text-muted-foreground">
                  Software Engineering &amp; Architecture
                </p>
              </div>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Softwares de precisão para equipes de engenharia que medem em microssegundos.
            </p>
            <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
              <span className="animate-status-dot inline-block h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
              Todos os sistemas operacionais
            </div>
            <div className="flex gap-3">
              {[
                { icon: Github, label: "GitHub da GeckoLabs" },
                { icon: Twitter, label: "Twitter/X da GeckoLabs" },
                { icon: Linkedin, label: "LinkedIn da GeckoLabs" },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-border/70 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title} className="flex flex-col gap-3">
              <h3 className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">{col.title}</h3>
              {col.links.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-sm text-muted-foreground transition-colors duration-200 hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 sm:flex-row">
          <p className="font-mono text-xs text-muted-foreground">
            © 2026 GeckoLabs. Todos os direitos reservados.
          </p>
          <p className="font-mono text-xs text-muted-foreground/70">
            Compilado com precisão · build 2026.07
          </p>
        </div>
      </div>
    </footer>
  );
}
