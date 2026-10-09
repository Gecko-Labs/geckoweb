
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  api,
  clearAuthToken,
  getAuthToken,
  setAuthToken,
} from "../lib/api";

const AuthContext = createContext(null);

// A API pode retornar fullName; o frontend utiliza user.name.
const normalizeUser = (user) =>
  user
    ? {
        ...user,
        name: user.fullName ?? user.name,
      }
    : null;

export function AuthProvider({ children }) {
  // undefined = verificando autenticação
  // null = visitante desconectado
  // objeto = usuário autenticado
  const [user, setUser] = useState(undefined);

  const refresh = useCallback(async () => {
    const token = getAuthToken();

    // Não consultar /auth/me para visitantes sem token.
    if (!token) {
      setUser(null);
      return null;
    }

    try {
      const { data } = await api.get("/auth/me");
      const currentUser = normalizeUser(data);

      setUser(currentUser);

      return currentUser;
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        // Token rejeitado pela API.
        clearAuthToken();
        setUser(null);
        return null;
      }

      // Falhas de rede ou do servidor não devem apagar
      // automaticamente um token potencialmente válido.
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function initializeAuth() {
      const token = getAuthToken();

      if (!token) {
        if (active) {
          setUser(null);
        }
        return;
      }

      try {
        const { data } = await api.get("/auth/me");

        if (active) {
          setUser(normalizeUser(data));
        }
      } catch (error) {
        if (!active) {
          return;
        }

        if (error.status === 401 || error.status === 403) {
          clearAuthToken();
        }

        setUser(null);
      }
    }

    initializeAuth();

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/tenant/login", {
      email,
      password,
    });

    if (!data?.token) {
      throw new Error("A API não retornou um token de autenticação.");
    }

    setAuthToken(data.token);

    try {
      const { data: me } = await api.get("/auth/me");
      const currentUser = normalizeUser(me);

      setUser(currentUser);

      return currentUser;
    } catch (error) {
      clearAuthToken();
      setUser(null);
      throw error;
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post("/auth/tenant/register", {
      fullName: name,
      email,
      password,
    });

    if (!data?.token) {
      throw new Error("A API não retornou um token de autenticação.");
    }

    setAuthToken(data.token);

    try {
      const { data: me } = await api.get("/auth/me");
      const currentUser = normalizeUser(me);

      setUser(currentUser);

      return currentUser;
    } catch (error) {
      clearAuthToken();
      setUser(null);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    clearAuthToken();
    setUser(null);
  }, []);

  const value = {
    user,
    loading: user === undefined,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    refresh,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth deve ser utilizado dentro de um AuthProvider."
    );
  }

  return context;
}