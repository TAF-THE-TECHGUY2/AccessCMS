import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

const ProtectedRoute = ({ children, redirectIfActiveTo }) => {
  const { user, loading, investorData } = useAuth();
  if (loading) {
    return <div className="p-10 text-center text-slate">Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (
    redirectIfActiveTo &&
    investorData?.investments?.some((inv) => ["active", "funded"].includes(inv.status))
  ) {
    return <Navigate to={redirectIfActiveTo} replace />;
  }
  return children;
};

export default ProtectedRoute;
