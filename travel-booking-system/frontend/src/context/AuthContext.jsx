import { createContext, useContext, useEffect, useMemo, useState } from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const { data } = await api.get("/api/auth/me");
      setUser(data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      fetchMe();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (payload) => {
    const normalizedPayload = {
      ...payload,
      email: payload.email.trim().toLowerCase(),
    };
    const { data } = await api.post("/api/auth/login", normalizedPayload);
    localStorage.setItem("token", data.access_token);
    await fetchMe();
  };

  const register = async (payload) => {
    const normalizedPayload = {
      ...payload,
      email: payload.email.trim().toLowerCase(),
    };
    await api.post("/api/auth/register", normalizedPayload);
    await login({ email: normalizedPayload.email, password: normalizedPayload.password });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshUser: fetchMe }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
