import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/invest-now" replace />;
  if (!sessionStorage.getItem("invest_gate")) return <Navigate to="/invest-now" replace />;
  return children;
}
