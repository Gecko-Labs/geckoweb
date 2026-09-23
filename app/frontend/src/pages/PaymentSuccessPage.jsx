import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Copy, Download, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { api } from "../lib/api";
import { useCart } from "../context/CartContext";
import { formatUSD, formatDate } from "../utils/format";

export default function PaymentSuccessPage() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const { clear } = useCart();
  const [state, setState] = useState("processing"); // processing | paid | pending
  const [order, setOrder] = useState(null);
  const cleared = useRef(false);

  useEffect(() => {
    if (!sessionId) return setState("pending");
    let attempts = 0;
    const poll = async () => {
      try {
        const { data } = await api.get(`/payments/status/${sessionId}`);
        if (data.payment_status === "paid") {
          setState("paid");
          if (!cleared.current) {
            cleared.current = true;
            clear();
          }
          if (data.order_id) {
            const res = await api.get(`/orders/${data.order_id}`);
            setOrder(res.data);
          }
          return;
        }
      } catch (e) {}
      attempts += 1;
      if (attempts < 15) setTimeout(poll, 2000);
      else setState("pending");
    };
    poll();
  }, [sessionId, clear]);

  const copyKey = (key) => {
    navigator.clipboard?.writeText(key);
    toast.success("Chave copiada");
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center px-4 pb-24 pt-32 sm:px-6" data-testid="payment-success-page">
      {state === "processing" && (
        <div className="flex flex-col items-center gap-4 pt-16 text-center" data-testid="payment-processing">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <h1 className="font-display text-3xl font-bold uppercase">Confirmando pagamento…</h1>
          <p className="text-sm text-muted-foreground">Estamos validando a confirmação da Stripe. Leva só alguns segundos.</p>
        </div>
      )}

      {state === "pending" && (
        <div className="flex flex-col items-center gap-4 pt-16 text-center" data-testid="payment-pending">
          <Loader2 className="h-10 w-10 animate-spin text-amber-400" />
          <h1 className="font-display text-3xl font-bold uppercase">Pagamento em processamento</h1>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Ainda estamos aguardando a confirmação do gateway. Assim que for aprovado, suas licenças aparecem
            automaticamente em <Link to="/account" className="text-primary hover:underline">Minha conta</Link> e chegam por email.
          </p>
        </div>
      )}

      {state === "paid" && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
          data-testid="payment-confirmed"
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.15 }}
              className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/40 bg-primary/10"
            >
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </motion.span>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary">Pagamento aprovado</p>
            <h1 className="font-display text-4xl font-black uppercase tracking-tight">Licenças emitidas</h1>
            {order && (
              <p className="font-mono text-xs text-muted-foreground">
                Pedido {order.order_id} · {formatDate(order.paid_at || order.created_at)} · {formatUSD(order.total_cents)}
              </p>
            )}
          </div>

          {order && order.licenses && (
            <div className="mt-10 flex flex-col gap-4">
              {order.licenses.map((lic) => (
                <div key={lic.key} className="rounded-xl border border-border/70 bg-card p-5" data-testid={`issued-license-${lic.product_slug}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display text-lg font-bold">{lic.product_name}</p>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {lic.tier === "enterprise" ? "Enterprise Vault" : "Standard Seat"}
                      </p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-primary">
                      ativa
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-3">
                    <code className="flex-1 truncate font-mono text-sm text-primary">{lic.key}</code>
                    <button
                      type="button"
                      onClick={() => copyKey(lic.key)}
                      aria-label={`Copiar chave de ${lic.product_name}`}
                      data-testid={`copy-key-${lic.product_slug}`}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:text-primary"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/account?tab=downloads"
              data-testid="success-downloads-button"
              className="flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/25"
            >
              <Download className="h-4 w-4" /> Baixar artefatos
            </Link>
            <Link
              to="/products"
              className="rounded-md border border-border px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              Continuar explorando
            </Link>
          </div>
          <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Um email de confirmação foi enviado para a sua conta
          </p>
        </motion.div>
      )}
    </main>
  );
}
