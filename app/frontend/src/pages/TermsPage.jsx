import { FadeIn } from "../components/Reveal";

const SECTIONS = [
  {
    id: "objeto",
    title: "1. Objeto",
    body: "Estes Termos de Uso regem a aquisição e o uso de licenças dos softwares GeckoLabs (\u201cProdutos\u201d), incluindo GeckoTrace Ultra, PrismMesh, PolyVault HSM, GeckoLens AI, StreamSync Postgres e ApexWasm. Ao concluir uma compra, você celebra um contrato de licenciamento de software com a GeckoLabs.",
  },
  {
    id: "licenca",
    title: "2. Concessão de licença",
    body: "A licença Standard concede uso por 1 (um) desenvolvedor em até 3 (três) máquinas. A licença Enterprise Vault concede uso ilimitado dentro da organização licenciada, incluindo ambientes air-gapped. A licença é perpétua para a versão majoritária adquirida e inclui 12 meses de atualizações.",
  },
  {
    id: "restricoes",
    title: "3. Restrições",
    body: "É vedado: (a) redistribuir, revender ou sublicenciar os binários ou chaves de licença; (b) remover mecanismos de verificação de integridade; (c) utilizar os Produtos para violar leis ou direitos de terceiros. Engenharia reversa é permitida apenas na medida expressamente autorizada pela legislação aplicável.",
  },
  {
    id: "pagamento",
    title: "4. Pagamento e entrega",
    body: "Os preços são exibidos em dólares americanos (US$) e processados por gateway de pagamento independente (Stripe). A confirmação ocorre exclusivamente por validação do backend via webhook do gateway. Após a aprovação, a chave de licença é emitida automaticamente e vinculada à sua conta GeckoLabs.",
  },
  {
    id: "reembolso",
    title: "5. Reembolso",
    body: "Você pode solicitar reembolso integral em até 14 (catorze) dias corridos após a compra, sem necessidade de justificativa, pelo canal suporte@geckolabs.dev ou pela Central de Suporte. Após o reembolso, as licenças correspondentes são revogadas e os downloads bloqueados.",
  },
  {
    id: "suporte",
    title: "6. Suporte e SLA",
    body: "Licenças Standard incluem suporte por ticket com resposta em até 48h úteis. Licenças Enterprise Vault incluem SLA de 24h, canal prioritário e builds assinados sob demanda.",
  },
  {
    id: "responsabilidade",
    title: "7. Limitação de responsabilidade",
    body: "Os Produtos são fornecidos com builds determinísticos e verificáveis. Na máxima extensão permitida em lei, a responsabilidade total da GeckoLabs limita-se ao valor pago pela licença nos 12 meses anteriores ao evento.",
  },
  {
    id: "foro",
    title: "8. Legislação e foro",
    body: "Estes Termos são regidos pelas leis da República Federativa do Brasil, incluindo o Código de Defesa do Consumidor quando aplicável. Fica eleito o foro da comarca de São Paulo/SP, salvo disposição legal em contrário.",
  },
];

export default function TermsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-24 pt-28 sm:px-6" data-testid="terms-page">
      <FadeIn>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Legal</p>
        <h1 className="mt-2 font-display text-4xl font-bold uppercase tracking-tight">Termos de Uso</h1>
        <p className="mt-3 font-mono text-xs text-muted-foreground">Última atualização: julho de 2026</p>
      </FadeIn>
      <div className="mt-10 flex flex-col gap-8">
        {SECTIONS.map((s) => (
          <FadeIn key={s.id} id={s.id} className="scroll-mt-28">
            <h2 className="font-display text-xl font-bold tracking-tight">{s.title}</h2>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </FadeIn>
        ))}
      </div>
    </main>
  );
}
