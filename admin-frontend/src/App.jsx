import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminLayout from "./components/AdminLayout.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Pages from "./pages/Pages.jsx";
import PageEditor from "./pages/PageEditor.jsx";
import Properties from "./pages/Properties.jsx";
import PropertyEditor from "./pages/PropertyEditor.jsx";
import Media from "./pages/Media.jsx";
import Team from "./pages/Team.jsx";
import Faq from "./pages/Faq.jsx";
import SiteSettings from "./pages/SiteSettings.jsx";
import Users from "./pages/Users.jsx";
import RequireAdmin from "./components/RequireAdmin.jsx";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/pages" element={<Pages />} />
                  <Route path="/pages/:id" element={<PageEditor />} />
                  <Route path="/pages/new" element={<PageEditor />} />
                  <Route path="/properties" element={<Properties />} />
                  <Route path="/properties/:id" element={<PropertyEditor />} />
                  <Route path="/properties/new" element={<PropertyEditor />} />
                  <Route path="/media" element={<Media />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/faq" element={<Faq />} />
                  <Route
                    path="/settings"
                    element={
                      <RequireAdmin>
                        <SiteSettings />
                      </RequireAdmin>
                    }
                  />
                  <Route
                    path="/users"
                    element={
                      <RequireAdmin>
                        <Users />
                      </RequireAdmin>
                    }
                  />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
