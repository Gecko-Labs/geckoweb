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

  const googleLogin = () => {
    const apiBase = import.meta.env.VITE_API_URL || "/api";
    const redirectUri = `${window.location.origin}/auth/callback`;
    window.location.href = `${apiBase}/auth/google?redirect_uri=${encodeURIComponent(redirectUri)}`;
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
              onClick={googleLogin}
              disabled={loading}
              data-testid="google-login-button"
              className="w-full flex items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-3 font-mono text-xs uppercase tracking-widest text-foreground transition-colors hover:bg-secondary hover:border-primary/40 disabled:opacity-60"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuar com Google
            </button>

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
