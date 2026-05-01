import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import InvestNowWizard from "./pages/InvestNowWizard.jsx";
import InvestorDashboard from "./pages/InvestorDashboard.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/invest-now" replace />} />
      <Route path="/invest-now" element={<InvestNowWizard />} />
      <Route path="/dashboard" element={<InvestorDashboard />} />
    </Routes>
  );
}
