export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  process.env.VITE_API_BASE_URL ||
  "http://localhost:5000";

const request = async (path) => {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Request failed");
  }
  return res.json();
};

export const api = {
  getPage: (slug) => {
    const normalized = slug === "/" ? "home" : slug;
    return request(`/api/pages/slug/${encodeURIComponent(normalized)}`);
  },
  getProperties: () => request(`/api/properties`),
  getProperty: (slug) => request(`/api/properties/slug/${slug}`),
  getFaq: () => request(`/api/faq`),
  getTeam: () => request(`/api/team`),
  getSettings: () => request(`/api/site-settings`),
};
