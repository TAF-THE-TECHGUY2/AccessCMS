import { API_BASE_URL, get } from "./lib/api.js";

export { API_BASE_URL };

export const api = {
  getPage: (slug) => {
    const normalized = slug === "/" ? "home" : slug;
    return get(`/api/pages/slug/${encodeURIComponent(normalized)}`);
  },
  getProperties: () => get(`/api/properties`),
  getProperty: (slug) => get(`/api/properties/slug/${slug}`),
  getFaq: () => get(`/api/faq`),
  getTeam: () => get(`/api/team`),
  getSettings: () => get(`/api/site-settings`),
};
