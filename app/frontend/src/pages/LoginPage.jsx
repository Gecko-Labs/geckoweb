import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { api, apiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { GeckoMark } from "../components/GeckoMark";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/account";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Sessão iniciada");
      navigate(from, { replace: true });
    } catch (err) {
      setError(apiError(err, "Credenciais inválidas"));
    } finally {
      setLoading(false);
    }
  };

  const submitForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/tenant/forgot-password", { email });
      setForgotSent(true);
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await login("demo@geckolabs.dev", "GeckoDemo2026!");
      toast.success("Sessão iniciada como Arquiteto Demo");
      navigate(from, { replace: true });
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 pb-16 pt-24" data-testid="login-page">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-xl border border-border/70 bg-card p-8"
      >
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <GeckoMark className="h-14 w-14 object-contain" />
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
            {forgotMode ? "Recuperar acesso" : "Entrar na GeckoLabs"}
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            Uma conta. Todo o ecossistema.
          </p>
        </div>

        {forgotMode ? (
          forgotSent ? (
            <div className="text-center" data-testid="forgot-sent">
              <p className="text-sm text-muted-foreground">
                Se o email existir na nossa base, você receberá o link de redefinição em instantes.
              </p>
              <button type="button" onClick={() => { setForgotMode(false); setForgotSent(false); }} className="mt-5 font-mono text-xs uppercase tracking-widest text-primary hover:underline">
                Voltar ao login
              </button>
            </div>
          ) : (
            <form onSubmit={submitForgot} className="flex flex-col gap-4">
              <div>
                <label htmlFor="forgot-email" className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Email da conta
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="forgot-email-input"
                  className="h-11 w-full rounded-md border border-input bg-background px-3.5 text-sm outline-none transition-colors focus:border-primary/50"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                data-testid="forgot-submit-button"
                className="rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/25 disabled:opacity-60"
              >
                {loading ? "Enviando…" : "Enviar link de redefinição"}
              </button>
              <button type="button" onClick={() => setForgotMode(false)} className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
                Voltar ao login
              </button>
            </form>
          )
        ) : (
          <>
            <form onSubmit={submit} className="flex flex-col gap-4" data-testid="login-form">
              <div>
                <label htmlFor="login-email" className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="login-email-input"
                  className="h-11 w-full rounded-md border border-input bg-background px-3.5 text-sm outline-none transition-colors focus:border-primary/50"
                />
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="login-password" className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Senha
                  </label>
                  <button type="button" onClick={() => setForgotMode(true)} className="font-mono text-[10px] uppercase tracking-widest text-primary hover:underline" data-testid="forgot-password-link">
                    Esqueci a senha
                  </button>
                </div>
                <input
                  id="login-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="login-password-input"
                  className="h-11 w-full rounded-md border border-input bg-background px-3.5 text-sm outline-none transition-colors focus:border-primary/50"
                />
              </div>

              {error && (
                <p role="alert" data-testid="login-error" className="rounded-md border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                data-testid="login-form-submit-button"
                className="rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? "Autenticando…" : "Entrar"}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">ou</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <button
              type="button"
              onClick={demoLogin}
              disabled={loading}
              data-testid="demo-login-button"
              className="w-full rounded-md border border-primary/30 bg-primary/5 px-4 py-3 font-mono text-xs uppercase tracking-widest text-primary transition-colors hover:bg-primary/10 disabled:opacity-60"
            >
              Entrar como Arquiteto Demo
            </button>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Ainda não tem conta?{" "}
              <Link to="/register" className="font-semibold text-primary hover:underline" data-testid="login-register-link">
                Criar conta
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </main>
  );
}
