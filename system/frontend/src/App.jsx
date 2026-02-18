import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./AuthContext.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import InvestNowWizard from "./pages/InvestNowWizard.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import InvestorDashboard from "./pages/InvestorDashboard.jsx";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/invest-now" replace />} />
        <Route path="/invest-now" element={<InvestNowWizard />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <InvestorDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
