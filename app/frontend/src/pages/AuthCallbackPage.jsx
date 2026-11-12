
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { apiError, setAuthToken, clearAuthToken } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { GeckoMark } from "../components/GeckoMark";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

// Obtém parâmetros da query string e do fragmento da URL.
function getCallbackParams(searchParams, hash) {
  const params = {};

  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  if (hash) {
    const hashParams = new URLSearchParams(hash.replace(/^#/, ""));

    hashParams.forEach((value, key) => {
      params[key] = value;
    });
  }

  return params;
}

// Limpa os dados temporários do OAuth.
function clearOAuthData() {
  sessionStorage.removeItem("oauth_state");
  sessionStorage.removeItem("oauth_return_url");
}

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refresh } = useAuth();

  const [state, setState] = useState("processing");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const handleCallback = async () => {
      const params = getCallbackParams(
        searchParams,
        window.location.hash
      );

      const token = params.token;
      const error = params.error;
      const errorDescription = params.error_description;

      clearOAuthData();

      // Remove o token da URL e do histórico.
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );

      if (cancelled) return;

      // Trata erros retornados pela API.
      if (error) {
        const msg =
          errorDescription ||
          error ||
          "Falha na autenticação com Google";

        setErrorMessage(msg);
        setState("error");
        toast.error(msg);

        navigate("/login", { replace: true });
        return;
      }

      // Verifica se o token foi recebido.
      if (!token) {
        const msg = "Token de autenticação não recebido";

        setErrorMessage(msg);
        setState("error");
        toast.error(msg);

        navigate("/login", { replace: true });
        return;
      }

      try {
        // Salva o JWT.
        setAuthToken(token);

        // Valida a sessão e carrega os dados do usuário.
        await refresh();

        if (cancelled) return;

        setState("success");
        toast.success("Login com Google realizado com sucesso");

        // REDIRECIONAMENTO DIRETO PARA A HOME.
        navigate("/", { replace: true });
      } catch (err) {
        clearAuthToken();

        if (cancelled) return;

        const msg = apiError(
          err,
          "Não foi possível validar a sessão"
        );

        setErrorMessage(msg);
        setState("error");
        toast.error(msg);

        navigate("/login", { replace: true });
      }
    };

    handleCallback();

    return () => {
      cancelled = true;
    };
  }, [searchParams, navigate, refresh]);

  // Estado de processamento.
  if (state === "processing") {
    return (
      <main
        className="flex min-h-screen items-center justify-center px-4"
        data-testid="auth-callback-page"
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="w-full max-w-md rounded-xl border border-border/70 bg-card p-8 text-center"
        >
          <GeckoMark className="mx-auto mb-6 h-14 w-14 object-contain" />

          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />

          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
            Finalizando login…
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Aguarde enquanto validamos sua autenticação com o Google.
          </p>
        </motion.div>
      </main>
    );
  }

  // Estado de erro.
  if (state === "error") {
    return (
      <main
        className="flex min-h-screen items-center justify-center px-4"
        data-testid="auth-callback-error"
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="w-full max-w-md rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center"
        >
          <GeckoMark className="mx-auto mb-6 h-14 w-14 object-contain opacity-60" />

          <AlertCircle className="mx-auto mb-4 h-10 w-10 text-destructive" />

          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-destructive">
            Falha na autenticação
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {errorMessage}
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => navigate("/login", { replace: true })}
              className="rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
            >
              Tentar novamente
            </button>

            <button
              onClick={() => navigate("/", { replace: true })}
              className="rounded-md border border-border px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary"
            >
              Voltar ao início
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  // Estado de sucesso.
  return (
    <main
      className="flex min-h-screen items-center justify-center px-4"
      data-testid="auth-callback-success"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.55,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="w-full max-w-md rounded-xl border border-primary/30 bg-primary/5 p-8 text-center"
      >
        <GeckoMark className="mx-auto mb-6 h-14 w-14 object-contain" />

        <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-primary" />

        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-primary">
          Autenticação confirmada
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Redirecionando para sua conta…
        </p>
      </motion.div>
    </main>
  );
}
