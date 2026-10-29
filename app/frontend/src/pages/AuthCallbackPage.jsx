import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { api, apiError, setAuthToken, clearAuthToken } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { GeckoMark } from "../components/GeckoMark";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

// Helper to parse params from both query string and URL fragment
function getCallbackParams(searchParams, hash) {
  const params = {};
  
  // From query string
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  // From fragment (hash)
  if (hash) {
    const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
    hashParams.forEach((value, key) => {
      params[key] = value;
    });
  }
  
  return params;
}

// Validate OAuth state parameter to prevent CSRF
function validateOAuthState(receivedState) {
  const storedState = sessionStorage.getItem("oauth_state");
  const returnUrl = sessionStorage.getItem("oauth_return_url") || "/";
  
  // Clean up stored values
  sessionStorage.removeItem("oauth_state");
  sessionStorage.removeItem("oauth_return_url");
  
  if (!storedState) {
    return { valid: false, error: "Estado de autenticação expirado ou inválido", returnUrl };
  }
  
  if (receivedState !== storedState) {
    return { valid: false, error: "Estado de autenticação inválido (CSRF protection)", returnUrl };
  }
  
  return { valid: true, returnUrl };
}

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [state, setState] = useState("processing"); // processing, success, error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const handleCallback = async () => {
      // Parse params from both query string and fragment
      const params = getCallbackParams(searchParams, window.location.hash);
      
      const token = params.token;
      const error = params.error;
      const errorDescription = params.error_description;
      const receivedState = params.state;

      // Clean up URL immediately (remove token from history)
      if (window.history.replaceState) {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }

      // Validate OAuth state parameter (CSRF protection)
      const stateValidation = validateOAuthState(receivedState);
      
      if (!stateValidation.valid) {
        const msg = stateValidation.error;
        setErrorMessage(msg);
        setState("error");
        toast.error(msg);
        if (!cancelled) navigate("/login", { replace: true });
        return;
      }

      const returnUrl = stateValidation.returnUrl;

      if (error) {
        const msg = errorDescription || error || "Falha na autenticação com Google";
        setErrorMessage(msg);
        setState("error");
        toast.error(msg);
        if (!cancelled) navigate("/login", { replace: true });
        return;
      }

      if (!token) {
        const msg = "Token de autenticação não recebido";
        setErrorMessage(msg);
        setState("error");
        toast.error(msg);
        if (!cancelled) navigate("/login", { replace: true });
        return;
      }

      try {
        // Store the token
        setAuthToken(token);

        // Verify token and fetch user
        await refresh();

        setState("success");
        toast.success("Login com Google realizado com sucesso");

        // Redirect to intended page or account
        const from = returnUrl || params.from || "/";
        if (!cancelled) navigate(from, { replace: true });
      } catch (err) {
        clearAuthToken();
        const msg = apiError(err, "Não foi possível validar a sessão");
        setErrorMessage(msg);
        setState("error");
        toast.error(msg);
        if (!cancelled) navigate("/login", { replace: true });
      }
    };

    handleCallback();

    return () => {
      cancelled = true;
    };
  }, [searchParams, navigate, refresh]);

  if (state === "processing") {
    return (
      <main className="flex min-h-screen items-center justify-center px-4" data-testid="auth-callback-page">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md rounded-xl border border-border/70 bg-card p-8 text-center"
        >
          <GeckoMark className="h-14 w-14 object-contain mx-auto mb-6" />
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Finalizando login…</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Aguarde enquanto validamos sua autenticação com o Google.
          </p>
        </motion.div>
      </main>
    );
  }

  if (state === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center px-4" data-testid="auth-callback-error">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center"
        >
          <GeckoMark className="h-14 w-14 object-contain mx-auto mb-6 opacity-60" />
          <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-destructive">
            Falha na autenticação
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>
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

  // Success state - brief display before redirect
  return (
    <main className="flex min-h-screen items-center justify-center px-4" data-testid="auth-callback-success">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-xl border border-primary/30 bg-primary/5 p-8 text-center"
      >
        <GeckoMark className="h-14 w-14 object-contain mx-auto mb-6" />
        <CheckCircle2 className="h-10 w-10 text-primary mx-auto mb-4" />
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-primary">
          Autenticação confirmada
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Redirecionando para sua conta…</p>
      </motion.div>
    </main>
  );
}