import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Brain, Users, FileText, ClipboardList, Sparkles, GitBranch, ShieldCheck, Download } from "lucide-react";
import { useI18n } from "../context/I18nContext";
import { FadeIn } from "../components/Reveal";

const FEATURES = [
  { icon: Users, key: "patients" },
  { icon: ClipboardList, key: "consultations" },
  { icon: FileText, key: "forms" },
  { icon: Brain, key: "instrumentation" },
  { icon: Sparkles, key: "ai" },
  { icon: FileText, key: "reports" },
  { icon: GitBranch, key: "results" },
];

export default function LaudIAPage() {
  const { t } = useI18n();
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl text-center">
          <FadeIn>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">LaudIA</p>
            <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">{t("laudia.hero.title", "LaudIA")}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{t("laudia.hero.subtitle", "Plataforma de IA para auxiliar na elaboração de laudos clínicos multiprofissionais.")}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/products" className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">{t("laudia.hero.ctaPrimary", "Conhecer o produto")}</Link>
              <Link to="/support" className="rounded-md border border-border px-6 py-3 text-sm font-semibold">{t("laudia.hero.ctaSecondary", "Falar com suporte")}</Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* What is */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <FadeIn>
            <h2 className="font-display text-2xl font-bold">{t("laudia.what.title", "O que é o LaudIA?")}</h2>
            <p className="mt-4 text-muted-foreground">{t("laudia.what.description", "O LaudIA é um aplicativo desktop para clínicas multiprofissionais que reúne gestão de pacientes e profissionais e uma central de IA para auxiliar na redação de laudos fundamentados em estudos científicos, sempre com revisão e assinatura do profissional responsável.")}</p>
          </FadeIn>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <FadeIn>
            <h2 className="font-display text-2xl font-bold">{t("laudia.features.title", "Funcionalidades e módulos")}</h2>
          </FadeIn>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, key }) => (
              <FadeIn key={key}>
                <div className="rounded-xl border border-border bg-card p-5">
                  <Icon className="h-6 w-6 text-primary" />
                  <h3 className="mt-3 font-semibold">{t(`laudia.features.${key}.title`, key)}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{t(`laudia.features.${key}.desc`, "")}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* AI */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <FadeIn>
            <h2 className="font-display text-2xl font-bold">{t("laudia.ai.title", "Inteligência artificial")}</h2>
            <p className="mt-4 text-muted-foreground">{t("laudia.ai.description", "A IA é uma ferramenta de assistência para agilizar a organização e a elaboração de documentos. Ela não substitui a avaliação e a responsabilidade profissional.")}</p>
          </FadeIn>
        </div>
      </section>

      {/* Instrumentation */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <FadeIn>
            <h2 className="font-display text-2xl font-bold">{t("laudia.instrumentation.title", "Instrumentação e Instrument.IA")}</h2>
            <p className="mt-4 text-muted-foreground">{t("laudia.instrumentation.description", "A integração com o Instrument.IA está planejada: resultados de instrumentos psicológicos poderão ser usados como contexto auxiliar na elaboração de laudos, mantendo fontes e resultados identificáveis.")}</p>
          </FadeIn>
        </div>
      </section>

      {/* Flow */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <FadeIn>
            <h2 className="font-display text-2xl font-bold">{t("laudia.flow.title", "Como o LaudIA otimiza o trabalho")}</h2>
            <ol className="mt-6 space-y-3">
              {["step1","step2","step3","step4","step5","step6","step7"].map((s, i) => (
                <li key={s} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">{t(`laudia.flow.${s}`, "")}</span>
                </li>
              ))}
            </ol>
          </FadeIn>
        </div>
      </section>

      {/* Availability */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <FadeIn>
            <h2 className="font-display text-2xl font-bold">{t("laudia.availability.title", "Disponibilidade e aquisição")}</h2>
            <p className="mt-4 text-muted-foreground">{t("laudia.availability.description", "Licença vitalícia, com validação offline. Atualizações pelo GeckoLauncher.")}</p>
            <Link to="/products" className="mt-6 inline-block rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">{t("laudia.availability.cta", "Ver no catálogo")}</Link>
          </FadeIn>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <FadeIn>
            <h2 className="font-display text-2xl font-bold">{t("laudia.faq.title", "Perguntas frequentes")}</h2>
          </FadeIn>
          <div className="mt-6 space-y-4">
            {[1,2,3,4].map((n) => (
              <div key={n} className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-semibold">{t(`laudia.faq.q${n}`, "")}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t(`laudia.faq.a${n}`, "")}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="px-4 py-20 text-center">
        <FadeIn>
          <h2 className="font-display text-2xl font-bold">{t("laudia.cta.title", "Pronto para otimizar sua rotina?")}</h2>
          <p className="mt-3 text-muted-foreground">{t("laudia.cta.description", "Conheça o LaudIA e centralize a gestão da sua clínica.")}</p>
          <Link to="/products" className="mt-6 inline-block rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">{t("laudia.cta.button", "Explorar produtos")}</Link>
        </FadeIn>
      </section>
    </main>
  );
}
