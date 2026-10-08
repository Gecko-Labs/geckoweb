import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { api, clearAuthToken, setAuthToken } from "../lib/api";

const AuthContext = createContext(null);

// A API devolve fullName; o resto do app usa user.name
const normalizeUser = (u) => (u ? { ...u, name: u.fullName ?? u.name } : u);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = verificando, null = visitante

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(normalizeUser(data));
    } catch {
      clearAuthToken();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/tenant/login", { email, password });
    setAuthToken(data.token);
    const { data: me } = await api.get("/auth/me");
    const currentUser = normalizeUser(me);
    setUser(currentUser);
    return currentUser;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post("/auth/tenant/register", {
      fullName: name,
      email,
      password,
    });
    setAuthToken(data.token);
    const { data: me } = await api.get("/auth/me");
    const currentUser = normalizeUser(me);
    setUser(currentUser);
    return currentUser;
  }, []);

  // JWT sem sessão no servidor: logout é só limpar o token local
  const logout = useCallback(async () => {
    clearAuthToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);