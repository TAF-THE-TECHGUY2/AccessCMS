import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

const client = axios.create({
  baseURL: API_BASE_URL
});

const getToken = () => localStorage.getItem("access_token");
const setToken = (token) => localStorage.setItem("access_token", token);
const clearToken = () => localStorage.removeItem("access_token");

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  register: async (payload) => {
    const data = await client.post("/api/auth/register", payload).then((r) => r.data);
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },
  login: async (payload) => {
    const data = await client.post("/api/auth/login", payload).then((r) => r.data);
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },
  logout: async () => {
    const data = await client.post("/api/auth/logout").then((r) => r.data);
    clearToken();
    return data;
  },
  me: () => client.get("/api/auth/me").then((r) => r.data),
  getProfile: () => client.get("/api/investor/profile").then((r) => r.data),
  updateProfile: (payload) => client.patch("/api/investor/profile", payload).then((r) => r.data),
  submitApplication: () => client.post("/api/investor/submit").then((r) => r.data),
  getStatus: () => client.get("/api/investor/status").then((r) => r.data),
  getChecklist: () => client.get("/api/investor/documents").then((r) => r.data),
  uploadDocument: (payload) => client.post("/api/investor/documents/upload", payload).then((r) => r.data),
  getAgreementPackage: () => client.get("/api/investor/documents/package").then((r) => r.data),
  acceptAgreement: () => client.post("/api/investor/agreement/accept").then((r) => r.data),
  getOfferings: () => client.get("/api/offerings").then((r) => r.data),
  createInvestment: (payload) => client.post("/api/investments", payload).then((r) => r.data),
  uploadPaymentProof: (payload) => client.post("/api/payments/proof", payload).then((r) => r.data),
  createCrowdfunderPurchase: (payload) => client.post("/api/crowdfunder/purchases", payload).then((r) => r.data),
  uploadCrowdfunderProof: (purchaseId, payload) =>
    client.post(`/api/crowdfunder/purchases/${purchaseId}/proof`, payload).then((r) => r.data),
  investorDashboard: () => client.get("/api/investor/dashboard").then((r) => r.data),
  onboardingBasic: (payload) => client.post("/api/onboarding/basic", payload).then((r) => r.data),
  onboardingExperience: (payload) => client.post("/api/onboarding/experience", payload).then((r) => r.data),
  onboardingSec: (payload) => client.post("/api/onboarding/sec", payload).then((r) => r.data),
  onboardingPathway: (payload) => client.post("/api/onboarding/pathway", payload).then((r) => r.data),
  onboardingProfile: (payload) => client.post("/api/onboarding/profile", payload).then((r) => r.data),
  onboardingDocuments: (payload) => client.post("/api/onboarding/documents", payload).then((r) => r.data),
  onboardingAccreditation: (payload) => client.post("/api/onboarding/accreditation", payload).then((r) => r.data),
  onboardingState: () => client.get("/api/onboarding/state").then((r) => r.data),
  onboardingStatus: () => client.get("/api/onboarding/status").then((r) => r.data),
  onboardingFunding: () => client.get("/api/onboarding/funding").then((r) => r.data)
};

export { API_BASE_URL, getToken, clearToken };
