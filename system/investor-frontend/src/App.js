import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import { OnboardingProvider } from "./lib/onboarding";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OnboardingWizard from "./pages/OnboardingWizard";
import AssistantRegister from "./pages/AssistantRegister";
import WelcomePage from "./pages/onboarding/WelcomePage";
import BasicProfileForm from "./pages/onboarding/BasicProfileForm";
import ExperienceAndIntent from "./pages/onboarding/ExperienceAndIntent";
import SECScreening from "./pages/onboarding/SECScreening";
import PathwaySelection from "./pages/onboarding/PathwaySelection";
import FullProfileForm from "./pages/onboarding/FullProfileForm";
import DocumentUpload from "./pages/onboarding/DocumentUpload";
import AccreditedVerification from "./pages/onboarding/AccreditedVerification";
import ReviewStatus from "./pages/onboarding/ReviewStatus";
import FundingInstructions from "./pages/onboarding/FundingInstructions";
import Dashboard from "./pages/onboarding/Dashboard";
import OnboardingWizardFlow from "./pages/onboarding/OnboardingWizardFlow";
import InvestorPanel from "./pages/InvestorPanel";

const App = () => (
  <AuthProvider>
    <OnboardingProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/welcome" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/assistant-register" element={<AssistantRegister />} />

          <Route
            path="/welcome"
            element={
              <ProtectedRoute redirectIfActiveTo="/investor">
                <WelcomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding/basic"
            element={
              <ProtectedRoute redirectIfActiveTo="/investor">
                <BasicProfileForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding/experience"
            element={
              <ProtectedRoute redirectIfActiveTo="/investor">
                <ExperienceAndIntent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding/sec"
            element={
              <ProtectedRoute redirectIfActiveTo="/investor">
                <SECScreening />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding/pathway"
            element={
              <ProtectedRoute redirectIfActiveTo="/investor">
                <PathwaySelection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding/profile"
            element={
              <ProtectedRoute redirectIfActiveTo="/investor">
                <FullProfileForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding/documents"
            element={
              <ProtectedRoute redirectIfActiveTo="/investor">
                <DocumentUpload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding/accreditation"
            element={
              <ProtectedRoute redirectIfActiveTo="/investor">
                <AccreditedVerification />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding/status"
            element={
              <ProtectedRoute redirectIfActiveTo="/investor">
                <ReviewStatus />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding/funding"
            element={
              <ProtectedRoute redirectIfActiveTo="/investor">
                <FundingInstructions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/onboarding"
            element={
              <ProtectedRoute redirectIfActiveTo="/investor">
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investor"
            element={
              <ProtectedRoute>
                <InvestorPanel />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </OnboardingProvider>
  </AuthProvider>
);

export default App;
