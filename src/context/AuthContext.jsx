import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, apiError } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
      return data;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (identifier, password) => {
    const { data } = await api.post("/auth/login", { identifier, password });
    setUser(data);
    return data;
  }, []);

  const registerPatient = useCallback(async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    setUser(data);
    return data;
  }, []);

  const registerDoctor = useCallback(async (payload) => {
    const { data } = await api.post("/auth/register/doctor", payload);
    setUser(data);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.warn("Server logout failed; clearing local session anyway:", e);
    }
    setUser(null);
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith("ayucore_case_"))
        .forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      console.warn("Could not clear local case cache:", e);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, registerPatient, registerDoctor, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { apiError };
