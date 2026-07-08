const runtimeConfig =
  typeof window !== "undefined" && window.__APP_CONFIG__ ? window.__APP_CONFIG__ : {};

const runtimeApiUrl = runtimeConfig.apiBaseUrl;

const getViteApiUrl = () => {
  try {
    return Function(
      "return import.meta && import.meta.env && import.meta.env.VITE_API_URL"
    )();
  } catch (error) {
    return undefined;
  }
};

const envApiUrl =
  (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_URL) ||
  getViteApiUrl();

const defaultApiUrl = "https://api.ap.boston";
const isProductionBuild =
  typeof process !== "undefined" &&
  process.env &&
  process.env.NODE_ENV === "production";

// In production, prefer the deploy-time config file over any build-time local env.
export const API_BASE_URL =
  (isProductionBuild
    ? runtimeApiUrl || envApiUrl
    : envApiUrl || runtimeApiUrl) || defaultApiUrl;

const request = async (method, path, options = {}) => {
  const { body, headers, ...rest } = options;
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json", ...headers } : headers,
    body: body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    const err = new Error(error.message || "Request failed");
    err.status = res.status;
    throw err;
  }

  return res.json();
};

export const get = (path, options) => request("GET", path, options);
export const post = (path, body, options = {}) =>
  request("POST", path, { ...options, body });
export const put = (path, body, options = {}) =>
  request("PUT", path, { ...options, body });
export const del = (path, options) => request("DELETE", path, options);
