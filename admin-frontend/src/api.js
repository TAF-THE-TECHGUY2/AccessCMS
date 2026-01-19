export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

let accessToken = null;
try {
  accessToken = localStorage.getItem("accessToken");
} catch {
  accessToken = null;
}

export const setAccessToken = (token) => {
  accessToken = token;
  try {
    if (token) {
      localStorage.setItem("accessToken", token);
    } else {
      localStorage.removeItem("accessToken");
    }
  } catch {
    // ignore storage errors
  }
};

const refreshAccessToken = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = await res.json();
    setAccessToken(data.accessToken);
    return data.accessToken;
  } catch {
    return null;
  }
};

const request = async (path, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  let res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers,
  });

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.Authorization = `Bearer ${newToken}`;
      res = await fetch(`${API_BASE_URL}${path}`, {
        credentials: "include",
        ...options,
        headers,
      });
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Request failed");
  }
  return res.json();
};

export const api = {
  login: (payload) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  refresh: () => request("/api/auth/refresh", { method: "POST" }),
  logout: () => request("/api/auth/logout", { method: "POST" }),
  me: () => request("/api/auth/me"),
  users: {
    list: () => request("/api/users"),
    create: (payload) => request("/api/users", { method: "POST", body: JSON.stringify(payload) }),
    update: (id, payload) =>
      request(`/api/users/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    remove: (id) => request(`/api/users/${id}`, { method: "DELETE" }),
  },
  pages: {
    list: () => request("/api/admin/pages"),
    create: (payload) => request("/api/admin/pages", { method: "POST", body: JSON.stringify(payload) }),
    update: (id, payload) =>
      request(`/api/admin/pages/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    publish: (id) => request(`/api/admin/pages/${id}/publish`, { method: "POST" }),
    remove: (id) => request(`/api/admin/pages/${id}`, { method: "DELETE" }),
  },
  properties: {
    list: () => request("/api/admin/properties"),
    create: (payload) =>
      request("/api/admin/properties", { method: "POST", body: JSON.stringify(payload) }),
    update: (id, payload) =>
      request(`/api/admin/properties/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    remove: (id) => request(`/api/admin/properties/${id}`, { method: "DELETE" }),
  },
  team: {
    list: () => request("/api/admin/team"),
    create: (payload) => request("/api/admin/team", { method: "POST", body: JSON.stringify(payload) }),
    update: (id, payload) =>
      request(`/api/admin/team/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    remove: (id) => request(`/api/admin/team/${id}`, { method: "DELETE" }),
  },
  faq: {
    list: () => request("/api/admin/faq"),
    create: (payload) => request("/api/admin/faq", { method: "POST", body: JSON.stringify(payload) }),
    update: (id, payload) =>
      request(`/api/admin/faq/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    remove: (id) => request(`/api/admin/faq/${id}`, { method: "DELETE" }),
  },
  media: {
    list: () => request("/api/admin/media"),
    upload: async (file) => {
      const form = new FormData();
      form.append("file", file);
      const headers = {};
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
      let res = await fetch(`${API_BASE_URL}/api/admin/media/upload`, {
        method: "POST",
        body: form,
        headers,
        credentials: "include",
      });
      if (res.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          const retryHeaders = { Authorization: `Bearer ${newToken}` };
          res = await fetch(`${API_BASE_URL}/api/admin/media/upload`, {
            method: "POST",
            body: form,
            headers: retryHeaders,
            credentials: "include",
          });
        }
      }
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Upload failed");
      }
      return res.json();
    },
    remove: (id) => request(`/api/admin/media/${id}`, { method: "DELETE" }),
  },
  settings: {
    get: () => request("/api/site-settings"),
    update: (payload) =>
      request("/api/admin/site-settings", { method: "PATCH", body: JSON.stringify(payload) }),
  },
};
