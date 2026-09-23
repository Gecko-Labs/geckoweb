import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { apiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { GeckoMark } from "../components/GeckoMark";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success("Conta criada — bem-vindo à GeckoLabs");
      navigate("/account", { replace: true });
    } catch (err) {
      setError(apiError(err, "Não foi possível criar a conta"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 pb-16 pt-24" data-testid="register-page">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-xl border border-border/70 bg-card p-8"
      >
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <GeckoMark className="h-14 w-14 object-contain" />
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Criar conta</h1>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            Licenças, downloads e pedidos em um só lugar
          </p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4" data-testid="register-form">
          <div>
            <label htmlFor="register-name" className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Nome completo
            </label>
            <input
              id="register-name"
              type="text"
              required
              minLength={2}
              autoComplete="name"
              value={form.name}
              onChange={set("name")}
              data-testid="register-name-input"
              className="h-11 w-full rounded-md border border-input bg-background px-3.5 text-sm outline-none transition-colors focus:border-primary/50"
            />
          </div>
          <div>
            <label htmlFor="register-email" className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Email
            </label>
            <input
              id="register-email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={set("email")}
              data-testid="register-email-input"
              className="h-11 w-full rounded-md border border-input bg-background px-3.5 text-sm outline-none transition-colors focus:border-primary/50"
            />
          </div>
          <div>
            <label htmlFor="register-password" className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Senha <span className="text-muted-foreground/50">(mín. 8 caracteres)</span>
            </label>
            <input
              id="register-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={form.password}
              onChange={set("password")}
              data-testid="register-password-input"
              className="h-11 w-full rounded-md border border-input bg-background px-3.5 text-sm outline-none transition-colors focus:border-primary/50"
            />
          </div>

          {error && (
            <p role="alert" data-testid="register-error" className="rounded-md border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            data-testid="register-form-submit-button"
            className="rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? "Criando…" : "Criar conta"}
          </button>
        </form>

        <p className="mt-5 text-center font-mono text-[10px] leading-relaxed tracking-wide text-muted-foreground">
          Ao criar a conta você concorda com os{" "}
          <Link to="/terms" className="text-primary hover:underline">Termos de Uso</Link> e a{" "}
          <Link to="/privacy" className="text-primary hover:underline">Política de Privacidade</Link>.
        </p>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline" data-testid="register-login-link">
            Entrar
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
