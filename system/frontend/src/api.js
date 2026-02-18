const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const request = async (path, options = {}) => {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Request failed");
  }
  return res.json();
};

export const api = {
  csrf: () => fetch(`${API_BASE_URL}/sanctum/csrf-cookie`, { credentials: "include" }),
  register: (payload) => request("/api/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => request("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  logout: () => request("/api/auth/logout", { method: "POST" }),
  me: () => request("/api/auth/me"),
  profile: () => request("/api/investor/profile"),
  updateProfile: (payload) => request("/api/investor/profile", { method: "PATCH", body: JSON.stringify(payload) }),
  documents: () => request("/api/investor/documents"),
  uploadDocument: async (document_type_id, file) => {
    const form = new FormData();
    form.append("document_type_id", document_type_id);
    form.append("file", file);
    const res = await fetch(`${API_BASE_URL}/api/investor/documents/upload`, {
      method: "POST",
      body: form,
      credentials: "include",
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Upload failed");
    }
    return res.json();
  },
  package: () => request("/api/investor/documents/package"),
};
