import { Link } from "react-router-dom";
import { XCircle } from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-5 px-4 text-center" data-testid="payment-cancel-page">
      <XCircle className="h-12 w-12 text-muted-foreground" />
      <h1 className="font-display text-4xl font-bold uppercase tracking-tight">Pagamento cancelado</h1>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        Nenhuma cobrança foi realizada. Seu carrinho continua salvo — você pode retomar quando quiser.
      </p>
      <div className="flex gap-4">
        <Link
          to="/cart"
          data-testid="cancel-back-to-cart"
          className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/25"
        >
          Voltar ao carrinho
        </Link>
        <Link to="/products" className="rounded-md border border-border px-6 py-3 text-sm text-muted-foreground transition-colors hover:text-foreground">
          Explorar softwares
        </Link>
      </div>
    </main>
  );
}
