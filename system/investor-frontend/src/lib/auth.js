import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, clearToken } from "./api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [investorData, setInvestorData] = useState({ investments: [], payments: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .me()
      .then(async (data) => {
        setUser(data.user);
        try {
          const dashboard = await api.investorDashboard();
          setInvestorData(dashboard || { investments: [], payments: [] });
        } catch {
          setInvestorData({ investments: [], payments: [] });
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      user,
      investorData,
      loading,
      login: async (payload) => {
        const data = await api.login(payload);
        setUser(data.user);
        try {
          const dashboard = await api.investorDashboard();
          setInvestorData(dashboard || { investments: [], payments: [] });
        } catch {
          setInvestorData({ investments: [], payments: [] });
        }
        return data;
      },
      register: async (payload) => {
        const data = await api.register(payload);
        setUser(data.user);
        setInvestorData({ investments: [], payments: [] });
        return data;
      },
      logout: async () => {
        await api.logout();
        clearToken();
        setUser(null);
        setInvestorData({ investments: [], payments: [] });
      }
    }),
    [user, investorData, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
