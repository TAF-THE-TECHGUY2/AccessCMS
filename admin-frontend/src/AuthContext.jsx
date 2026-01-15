import React, { createContext, useContext, useEffect, useState } from "react";
import { api, setAccessToken } from "./api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = async () => {
    try {
      const data = await api.me();
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const refresh = await api.refresh();
        setAccessToken(refresh.accessToken);
        await loadMe();
      } catch {
        setLoading(false);
      }
    };
    init();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
