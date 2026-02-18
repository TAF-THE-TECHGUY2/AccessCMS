import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "./api";

const OnboardingContext = createContext(null);

export const OnboardingProvider = ({ children }) => {
  const [state, setState] = useState({
    basic: null,
    experience: null,
    sec: null,
    pathway: null,
    profile: null,
    documents: [],
    accreditation: null
  });

  useEffect(() => {
    api.onboardingState()
      .then((data) => {
        setState((prev) => ({
          ...prev,
          basic: data.basic || prev.basic,
          experience: data.experience || prev.experience,
          sec: data.sec || prev.sec,
          pathway: data.pathway || prev.pathway,
          profile: data.profile || prev.profile,
          documents: data.documents || prev.documents,
        }));
      })
      .catch(() => {});
  }, []);

  const value = useMemo(
    () => ({
      state,
      saveBasic: async (payload) => {
        await api.onboardingBasic(payload);
        setState((prev) => ({ ...prev, basic: payload }));
      },
      saveExperience: async (payload) => {
        await api.onboardingExperience(payload);
        setState((prev) => ({ ...prev, experience: payload }));
      },
      saveSec: async (payload) => {
        await api.onboardingSec(payload);
        setState((prev) => ({ ...prev, sec: payload }));
      },
      savePathway: async (payload) => {
        await api.onboardingPathway(payload);
        setState((prev) => ({ ...prev, pathway: payload }));
      },
      saveProfile: async (payload) => {
        await api.onboardingProfile(payload);
        setState((prev) => ({ ...prev, profile: payload }));
      },
      uploadDocument: async (payload) => {
        const data = await api.onboardingDocuments(payload);
        setState((prev) => ({ ...prev, documents: [...prev.documents, data.document] }));
      },
      saveAccreditation: async (payload) => {
        await api.onboardingAccreditation(payload);
        setState((prev) => ({ ...prev, accreditation: payload }));
      },
      fetchStatus: async () => api.onboardingStatus(),
      fetchFunding: async () => api.onboardingFunding()
    }),
    [state]
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};

export const useOnboarding = () => useContext(OnboardingContext);
