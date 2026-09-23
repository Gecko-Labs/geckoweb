import { FadeIn } from "../components/Reveal";

const SECTIONS = [
  {
    title: "1. Dados que coletamos",
    body: "Coletamos apenas o necessário para operar a loja: nome, email, histórico de pedidos, licenças emitidas e registros técnicos de segurança (tentativas de login). Dados de pagamento são processados diretamente pela Stripe e jamais trafegam ou são armazenados em nossos servidores.",
  },
  {
    title: "2. Base legal e finalidade (LGPD)",
    body: "Tratamos dados pessoais com base na execução de contrato (entrega de licenças e downloads), no cumprimento de obrigação legal (registros fiscais de transações) e no legítimo interesse (segurança da plataforma e prevenção a fraude), conforme os artigos 7º e 11 da Lei nº 13.709/2018 (LGPD).",
  },
  {
    title: "3. Emails transacionais vs. marketing",
    body: "Emails de cadastro, confirmação de pedido, status de pagamento, entrega de licença e recuperação de senha são transacionais e indispensáveis à operação do serviço. Comunicações de marketing são enviadas somente mediante consentimento separado e podem ser canceladas a qualquer momento.",
  },
  {
    title: "4. Telemetria",
    body: "Nossos produtos não coletam telemetria por padrão. Qualquer envio de dados de diagnóstico é opt-in, documentado e auditável pelo usuário, incluindo em ambientes air-gapped.",
  },
  {
    title: "5. Compartilhamento",
    body: "Não vendemos dados pessoais. Compartilhamos o mínimo necessário com operadores essenciais: processador de pagamento (Stripe) e provedor de email transacional, ambos sob contratos de proteção de dados.",
  },
  {
    title: "6. Seus direitos",
    body: "Você pode confirmar a existência de tratamento, acessar, corrigir, anonizar, portar ou eliminar seus dados pessoais. As ações de exportação (JSON completo) e eliminação da conta estão disponíveis diretamente em Minha Conta → Configurações, ou pelo canal privacidade@geckolabs.dev. Responderemos em até 15 dias.",
  },
  {
    title: "7. Segurança e retenção",
    body: "Utilizamos HTTPS, senhas com hash bcrypt, sessões em cookies httpOnly de curta duração e proteção contra força bruta. Dados de conta são retidos enquanto a conta existir; registros fiscais seguem os prazos legais aplicáveis.",
  },
  {
    title: "8. Encarregado de dados (DPO)",
    body: "Nosso encarregado pelo tratamento de dados pessoais pode ser contatado em privacidade@geckolabs.dev. Você também pode apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD).",
  },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-24 pt-28 sm:px-6" data-testid="privacy-page">
      <FadeIn>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Legal · LGPD</p>
        <h1 className="mt-2 font-display text-4xl font-bold uppercase tracking-tight">Política de Privacidade</h1>
        <p className="mt-3 font-mono text-xs text-muted-foreground">Última atualização: julho de 2026</p>
      </FadeIn>
      <div className="mt-10 flex flex-col gap-8">
        {SECTIONS.map((s) => (
          <FadeIn key={s.title}>
            <h2 className="font-display text-xl font-bold tracking-tight">{s.title}</h2>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </FadeIn>
        ))}
      </div>
    </main>
  );
}
