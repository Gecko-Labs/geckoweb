import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { api, apiError } from "../lib/api";
import { GeckoMark } from "../components/GeckoMark";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/tenant/reset-password", { token, password });
      setDone(true);
      toast.success("Senha redefinida com sucesso");
    } catch (err) {
      setError(apiError(err, "Não foi possível redefinir a senha"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 pb-16 pt-24" data-testid="reset-password-page">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="w-full max-w-md rounded-xl border border-border/70 bg-card p-8"
      >
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <GeckoMark className="h-14 w-14 object-contain" />
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Nova senha</h1>
        </div>

        {!token ? (
          <p className="text-center text-sm text-muted-foreground" data-testid="reset-invalid">
            Link de redefinição inválido. Solicite um novo em{" "}
            <Link to="/login" className="text-primary hover:underline">Entrar</Link>.
          </p>
        ) : done ? (
          <div className="text-center" data-testid="reset-success">
            <p className="text-sm text-muted-foreground">Sua senha foi redefinida.</p>
            <Link to="/login" className="mt-5 inline-block rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
              Entrar agora
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="reset-password" className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Nova senha <span className="text-muted-foreground/50">(mín. 8 caracteres)</span>
              </label>
              <input
                id="reset-password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="reset-password-input"
                className="h-11 w-full rounded-md border border-input bg-background px-3.5 text-sm outline-none transition-colors focus:border-primary/50"
              />
            </div>
            {error && (
              <p role="alert" data-testid="reset-error" className="rounded-md border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              data-testid="reset-submit-button"
              className="rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/25 disabled:opacity-60"
            >
              {loading ? "Redefinindo…" : "Redefinir senha"}
            </button>
          </form>
        )}
      </motion.div>
    </main>
  );
}
