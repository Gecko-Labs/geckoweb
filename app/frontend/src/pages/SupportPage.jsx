import { useState } from "react";
import { LifeBuoy, Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";

import { api, apiError } from "../lib/api";
import { FadeIn } from "../components/Reveal";
import { SectionHeading } from "../components/SectionHeading";

const initial = { name: "", email: "", subject: "", message: "" };

export default function SupportPage() {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/support", form);
      setTicket(data.ticket_id);
      toast.success(`Ticket ${data.ticket_id} aberto com sucesso`);
      setForm(initial);
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 pb-24 pt-28 sm:px-6 lg:px-8" data-testid="support-page">
      <SectionHeading
        chapter="Suporte // Engenharia"
        title="Fale com quem constrói"
        description="Tickets respondidos diretamente pela equipe de engenharia. SLA de 24h para licenças Enterprise."
      />

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <FadeIn className="lg:col-span-7">
          <form onSubmit={submit} className="flex flex-col gap-5 rounded-xl border border-border/70 bg-card p-7" data-testid="support-form">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="support-name" className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Nome
                </label>
                <input
                  id="support-name"
                  type="text"
                  required
                  minLength={2}
                  value={form.name}
                  onChange={set("name")}
                  data-testid="support-name-input"
                  className="h-11 w-full rounded-md border border-input bg-background px-3.5 text-sm outline-none transition-colors focus:border-primary/50"
                />
              </div>
              <div>
                <label htmlFor="support-email" className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Email
                </label>
                <input
                  id="support-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={set("email")}
                  data-testid="support-email-input"
                  className="h-11 w-full rounded-md border border-input bg-background px-3.5 text-sm outline-none transition-colors focus:border-primary/50"
                />
              </div>
            </div>
            <div>
              <label htmlFor="support-subject" className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Assunto
              </label>
              <input
                id="support-subject"
                type="text"
                required
                minLength={3}
                value={form.subject}
                onChange={set("subject")}
                data-testid="support-subject-input"
                className="h-11 w-full rounded-md border border-input bg-background px-3.5 text-sm outline-none transition-colors focus:border-primary/50"
              />
            </div>
            <div>
              <label htmlFor="support-message" className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Mensagem
              </label>
              <textarea
                id="support-message"
                required
                minLength={10}
                rows={6}
                value={form.message}
                onChange={set("message")}
                data-testid="support-message-input"
                className="w-full rounded-md border border-input bg-background px-3.5 py-3 text-sm outline-none transition-colors focus:border-primary/50"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              data-testid="support-submit-button"
              className="self-start rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? "Abrindo ticket…" : "Abrir ticket"}
            </button>
            {ticket && (
              <p className="rounded-md border border-primary/30 bg-primary/10 px-4 py-3 font-mono text-xs text-primary" data-testid="support-ticket-confirmation">
                Ticket {ticket} registrado. Responderemos no email informado.
              </p>
            )}
          </form>
        </FadeIn>

        <FadeIn delay={0.1} className="flex flex-col gap-5 lg:col-span-5">
          {[
            {
              icon: LifeBuoy,
              title: "SLA de resposta",
              desc: "Licenças Standard: 48h úteis. Enterprise Vault: 24h com canal prioritário e engenheiro designado.",
            },
            {
              icon: Mail,
              title: "Canal direto",
              desc: "suporte@geckolabs.dev — inclua seu ID de pedido (GL-…) para agilizar o atendimento.",
            },
            {
              icon: MessageSquare,
              title: "Status dos sistemas",
              desc: "Entrega de licenças, downloads e API operando normalmente. Incidentes são comunicados por email transacional.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-border/70 bg-card p-6">
              <item.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-3 font-display text-lg font-bold tracking-tight">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </FadeIn>
      </div>
    </main>
  );
}
