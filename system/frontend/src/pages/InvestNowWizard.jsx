import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdvisorCard from "../components/onboarding/AdvisorCard.jsx";
import FAQScreen from "../components/onboarding/FAQScreen.jsx";
import OnboardingLayout from "../components/onboarding/OnboardingLayout.jsx";
import OptionButton from "../components/onboarding/OptionButton.jsx";
import PrimaryButton from "../components/onboarding/PrimaryButton.jsx";
import StepCard from "../components/onboarding/StepCard.jsx";
import { saveOnboardingDraft } from "../services/onboardingApi.js";

const onboardingSteps = [
  { id: "welcome", label: "Welcome" },
  { id: "services", label: "Services Overview" },
  { id: "process", label: "Process Overview" },
  { id: "explore", label: "Explore or Continue" },
  { id: "profile", label: "Create Profile" },
  { id: "experience", label: "Investment Experience" },
  { id: "amount", label: "Investment Amount" },
  { id: "fund", label: "Fund Overview" },
  { id: "accreditation", label: "Accreditation" },
  { id: "next", label: "Next Steps" },
  { id: "final", label: "Final Confirmation" },
];

const experienceHelperText = {
  experienced:
    "Great. We'll keep the process concise while still highlighting the key information and next actions you'll want to review.",
  new:
    "No problem. We'll keep the process simple and explain each step clearly before you move forward.",
};

const initialOnboardingData = {
  profile: {
    firstName: "",
    lastName: "",
    email: "",
    mobilePhone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    stateProvince: "",
    zipPostalCode: "",
    country: "",
    receiveUpdates: true,
  },
  experienceLevel: "",
  amountRange: "",
  accreditationStatus: null,
  exploreFirst: false,
  viewedFootnotes: false,
  faqHistory: [],
};

const inputClassName =
  "min-h-[64px] w-full rounded-[18px] border border-ap-border bg-white px-5 py-4 text-base text-ap-ink shadow-sm outline-none transition placeholder:text-[#94a0ad] focus:border-ap-teal focus:shadow-[0_0_0_3px_rgba(47,111,115,0.08)]";

const findStepIndex = (stepId) => onboardingSteps.findIndex((step) => step.id === stepId);

export default function InvestNowWizard() {
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [onboardingData, setOnboardingData] = useState(initialOnboardingData);
  const [showFootnotes, setShowFootnotes] = useState(false);
  const [showAccreditationDetails, setShowAccreditationDetails] = useState(false);
  const [faqMode, setFaqMode] = useState(false);
  const [selectedFaqId, setSelectedFaqId] = useState("");
  const finalLogDone = useRef(false);

  const currentStep = onboardingSteps[currentStepIndex];
  const firstName = onboardingData.profile.firstName.trim();
  const isAccredited = onboardingData.accreditationStatus === "accredited";

  useEffect(() => {
    saveOnboardingDraft(onboardingData).catch(() => {});
  }, [onboardingData]);

  useEffect(() => {
    if (currentStep?.id === "final" && !finalLogDone.current) {
      console.log("Access Properties onboardingData", onboardingData);
      finalLogDone.current = true;
    }
  }, [currentStep, onboardingData]);

  const aside = useMemo(
    () => (
      <div className="space-y-4">
        <div className="rounded-[30px] border border-ap-border bg-white p-7 shadow-float">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ap-muted">Current Offering</p>
          <h3 className="mt-4 font-serif text-[2.1rem] leading-[1.08] text-[#2f3f44]">
            Access Properties Real Estate Diversified Income Fund I
          </h3>
          <p className="mt-5 text-base leading-8 text-ap-muted">
            A guided onboarding path for investors evaluating professionally managed real estate exposure.
          </p>
        </div>
        <div className="rounded-[30px] border border-ap-border bg-white p-7 shadow-float">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ap-muted">Helpful To Have Ready</p>
          <ul className="mt-5 space-y-4 text-base leading-8 text-ap-muted">
            <li>Your contact details</li>
            <li>Your mailing address</li>
            <li>A general sense of your target investment amount</li>
          </ul>
        </div>
      </div>
    ),
    []
  );

  const goToStep = (stepId) => {
    const nextIndex = findStepIndex(stepId);
    if (nextIndex >= 0) setCurrentStepIndex(nextIndex);
  };

  const handleBack = () => {
    if (faqMode) {
      if (selectedFaqId) {
        setSelectedFaqId("");
        return;
      }
      setFaqMode(false);
      return;
    }
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  };

  const handleContinue = () => {
    if (currentStepIndex < onboardingSteps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const updateProfile = (field, value) => {
    setOnboardingData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value,
      },
    }));
  };

  const setAnswer = (field, value) => {
    setOnboardingData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isProfileComplete = () => {
    const profile = onboardingData.profile;
    return [
      profile.firstName,
      profile.lastName,
      profile.email,
      profile.mobilePhone,
      profile.addressLine1,
      profile.city,
      profile.stateProvince,
      profile.zipPostalCode,
      profile.country,
    ].every((value) => String(value).trim().length > 0);
  };

  const canContinue = () => {
    switch (currentStep.id) {
      case "profile":
        return isProfileComplete();
      case "experience":
        return Boolean(onboardingData.experienceLevel);
      case "amount":
        return Boolean(onboardingData.amountRange);
      case "accreditation":
        return onboardingData.accreditationStatus !== null;
      default:
        return true;
    }
  };

  const handleExploreFirst = () => {
    setFaqMode(true);
    setSelectedFaqId("");
    setAnswer("exploreFirst", true);
  };

  const handleSelectFaq = (faqId) => {
    setSelectedFaqId(faqId);
    setOnboardingData((prev) => ({
      ...prev,
      faqHistory: prev.faqHistory.includes(faqId) ? prev.faqHistory : [...prev.faqHistory, faqId],
    }));
  };

  const nextStepsItems = isAccredited
    ? [
        "Complete identity verification",
        "Receive funding instructions",
        "Investment activated once funds are received",
        "Access legal documents, performance metrics, and communications",
      ]
    : [
        "Complete identity verification",
        "Once approved, receive a link to the equity crowdfunding partner",
        "Access legal documents, performance metrics, and communications",
      ];

  const renderFooter = ({ continueLabel = "Continue", onContinueClick } = {}) => (
    <PrimaryButton disabled={!canContinue()} onClick={onContinueClick || handleContinue}>
      {continueLabel}
    </PrimaryButton>
  );

  const stepContent = (() => {
    if (faqMode) {
      return (
        <FAQScreen
          selectedFaqId={selectedFaqId}
          onSelectFaq={handleSelectFaq}
          onAskAnother={() => setSelectedFaqId("")}
          onContinue={() => {
            setFaqMode(false);
            goToStep("profile");
          }}
        />
      );
    }

    switch (currentStep.id) {
      case "welcome":
        return (
          <section className="overflow-hidden rounded-[32px] border border-ap-border bg-white shadow-calm">
            <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
              <div className="relative overflow-hidden bg-gradient-to-br from-[#fbf8f3] via-white to-[#e8ece8] px-8 py-10 sm:px-10 lg:px-12 lg:py-14">
                <div className="absolute inset-0 opacity-70">
                  <div className="absolute left-[-10%] top-[14%] h-[360px] w-[360px] rounded-full bg-white/60 blur-2xl" />
                  <div className="absolute bottom-[-18%] left-[-6%] h-[220px] w-[120%] rotate-[-8deg] bg-[linear-gradient(135deg,rgba(216,200,184,0.18),rgba(255,255,255,0))]" />
                  <div className="absolute bottom-0 left-0 h-[180px] w-full bg-[radial-gradient(circle_at_15%_70%,rgba(216,200,184,0.22),transparent_45%)]" />
                </div>
                <div className="relative">
                  <p className="text-xs font-semibold uppercase tracking-[0.42em] text-ap-muted">Access Properties</p>
                  <h1 className="mt-6 max-w-md font-serif text-4xl leading-[1.04] text-[#2f3f44] sm:text-5xl">
                    Invest with Access Properties
                  </h1>
                  <div className="mt-8 h-px w-36 bg-ap-border" />
                  <ul className="mt-8 space-y-5 text-base leading-8 text-ap-ink">
                    {[
                      "Institutional-Grade Opportunities",
                      "Low Minimums to Start",
                      "Expert Guidance Along the Way",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-3 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-ap-teal" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="border-t border-ap-border bg-ap-panel px-6 py-8 sm:px-8 lg:border-l lg:border-t-0 lg:px-10 lg:py-10">
                <div className="mb-8 flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-ap-muted">Your Access Advisor</p>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-ap-teal/40" />
                    <span className="h-2.5 w-2.5 rounded-full bg-ap-teal" />
                  </div>
                </div>
                <AdvisorCard />
                <div className="mt-6 rounded-[24px] border border-ap-border bg-white px-5 py-6 shadow-sm">
                  <p className="font-serif text-2xl text-[#2f3f44]">Welcome.</p>
                  <p className="mt-3 text-base leading-7 text-ap-muted">
                    Let’s find the right investment path for you in a calm, guided flow that keeps each step clear.
                  </p>
                </div>
                <div className="mt-6 flex justify-end">
                  <PrimaryButton className="w-full sm:w-auto" onClick={handleContinue}>
                    Continue
                  </PrimaryButton>
                </div>
              </div>
            </div>
          </section>
        );
      case "services":
        return (
          <StepCard
            eyebrow="What To Expect"
            title="Here’s how I can help"
            className="mx-auto max-w-4xl"
            footer={renderFooter()}
          >
            <p className="text-base leading-7 text-ap-muted">I can help you:</p>
            <ul className="space-y-3 text-base leading-7 text-ap-ink">
              <li>Understand how Access Properties works</li>
              <li>Choose the right investment approach</li>
              <li>Complete onboarding and verification</li>
            </ul>
          </StepCard>
        );
      case "process":
        return (
          <StepCard
            eyebrow="Process Overview"
            title="Before we begin, here’s a quick overview of the onboarding process"
            className="mx-auto max-w-4xl"
          >
            <ol className="grid gap-3">
              {[
                "Create your profile",
                "Confirm eligibility",
                "Review your investment",
                "Complete your pending Investor Dashboard",
                "Finalize your investment",
                "Access your active Investment Dashboard",
              ].map((item, index) => (
                <li key={item} className="flex items-start gap-4 rounded-2xl border border-ap-beige/60 bg-[#FCFAF7] px-4 py-4">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-ap-teal text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <span className="pt-1 text-sm leading-6 text-ap-ink">{item}</span>
                </li>
              ))}
            </ol>
            <div className="flex flex-wrap gap-3">
              <PrimaryButton onClick={handleContinue}>Continue</PrimaryButton>
              <button
                type="button"
                onClick={() => {
                  setShowFootnotes((prev) => !prev);
                  setAnswer("viewedFootnotes", true);
                }}
                className="text-sm font-medium text-ap-teal underline underline-offset-4"
              >
                View footnotes
              </button>
            </div>
            {showFootnotes ? (
              <div className="rounded-[24px] border border-ap-beige/70 bg-white px-5 py-6 text-sm leading-7 text-ap-muted shadow-sm">
                Access Properties onboarding is informational only and does not itself create an investment commitment.
                Eligibility, disclosures, funding instructions, and final execution are subject to the applicable offering
                documents and compliance review.
              </div>
            ) : null}
          </StepCard>
        );
      case "explore":
        return (
          <StepCard eyebrow="Quick Decision" title="Would you like to keep going or explore first?" className="mx-auto max-w-4xl">
            <p className="text-base leading-7 text-ap-muted">This takes about 2–3 minutes.</p>
            <div className="flex flex-wrap gap-3">
              <PrimaryButton onClick={handleContinue}>Continue</PrimaryButton>
              <button
                type="button"
                onClick={handleExploreFirst}
                className="inline-flex items-center justify-center rounded-xl border border-ap-beige/80 bg-white px-5 py-3 text-sm font-medium text-ap-ink transition hover:border-ap-teal/40 hover:text-ap-teal"
              >
                I would like to explore first
              </button>
            </div>
          </StepCard>
        );
      case "profile":
        return (
          <StepCard
            eyebrow="Profile"
            title="Create your investor profile"
            description="We’ll use this information later for verification, communications, and your dashboard setup."
            footer={renderFooter()}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                className={inputClassName}
                placeholder="First name"
                value={onboardingData.profile.firstName}
                onChange={(event) => updateProfile("firstName", event.target.value)}
              />
              <input
                className={inputClassName}
                placeholder="Last name"
                value={onboardingData.profile.lastName}
                onChange={(event) => updateProfile("lastName", event.target.value)}
              />
              <input
                className={inputClassName}
                type="email"
                placeholder="Email"
                value={onboardingData.profile.email}
                onChange={(event) => updateProfile("email", event.target.value)}
              />
              <input
                className={inputClassName}
                placeholder="Mobile phone"
                value={onboardingData.profile.mobilePhone}
                onChange={(event) => updateProfile("mobilePhone", event.target.value)}
              />
              <div className="sm:col-span-2">
                <input
                  className={inputClassName}
                  placeholder="Address line 1"
                  value={onboardingData.profile.addressLine1}
                  onChange={(event) => updateProfile("addressLine1", event.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  className={inputClassName}
                  placeholder="Address line 2"
                  value={onboardingData.profile.addressLine2}
                  onChange={(event) => updateProfile("addressLine2", event.target.value)}
                />
              </div>
              <input
                className={inputClassName}
                placeholder="City"
                value={onboardingData.profile.city}
                onChange={(event) => updateProfile("city", event.target.value)}
              />
              <input
                className={inputClassName}
                placeholder="State / Province"
                value={onboardingData.profile.stateProvince}
                onChange={(event) => updateProfile("stateProvince", event.target.value)}
              />
              <input
                className={inputClassName}
                placeholder="Zip / Postal code"
                value={onboardingData.profile.zipPostalCode}
                onChange={(event) => updateProfile("zipPostalCode", event.target.value)}
              />
              <input
                className={inputClassName}
                placeholder="Country"
                value={onboardingData.profile.country}
                onChange={(event) => updateProfile("country", event.target.value)}
              />
            </div>
            <label className="flex items-start gap-3 rounded-[22px] border border-ap-border bg-ap-panel px-5 py-5 text-base leading-7 text-ap-muted">
              <input
                type="checkbox"
                className="mt-1 h-5 w-5 rounded accent-[#2F6F73]"
                checked={onboardingData.profile.receiveUpdates}
                onChange={(event) => updateProfile("receiveUpdates", event.target.checked)}
              />
              <span>Receive updates from Access Properties</span>
            </label>
          </StepCard>
        );
      case "experience":
        return (
          <StepCard
            eyebrow="Experience"
            title="Have you invested in real estate or private investments before?"
            className="mx-auto max-w-4xl"
            footer={renderFooter()}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <OptionButton
                title="Yes, I have"
                description="You have prior experience with real estate or private market investing."
                selected={onboardingData.experienceLevel === "experienced"}
                onClick={() => setAnswer("experienceLevel", "experienced")}
              />
              <OptionButton
                title="No, I’m new"
                description="You’re exploring this type of investment for the first time."
                selected={onboardingData.experienceLevel === "new"}
                onClick={() => setAnswer("experienceLevel", "new")}
              />
            </div>
            {onboardingData.experienceLevel ? (
              <div className="rounded-[22px] border border-ap-border bg-ap-panel px-5 py-5 text-base leading-7 text-ap-muted">
                {experienceHelperText[onboardingData.experienceLevel]}
              </div>
            ) : null}
          </StepCard>
        );
      case "amount":
        return (
          <StepCard
            eyebrow="Investment Amount"
            title="What amount are you considering?"
            className="mx-auto max-w-4xl"
            footer={renderFooter()}
          >
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                "$10K - $25K",
                "$25K - $50K",
                "$50K+",
              ].map((option) => (
                <OptionButton
                  key={option}
                  title={option}
                  centered
                  className="min-h-[68px]"
                  selected={onboardingData.amountRange === option}
                  onClick={() => setAnswer("amountRange", option)}
                />
              ))}
            </div>
          </StepCard>
        );
      case "fund":
        return (
          <StepCard
            eyebrow="Fund Overview"
            title="Here’s how investing with Access Properties works"
            className="mx-auto max-w-4xl"
            footer={renderFooter()}
          >
            <ul className="space-y-3 text-sm leading-7 text-ap-ink">
              <li>You invest into a real estate fund</li>
              <li>Capital is pooled with other investors</li>
              <li>Investments follow a defined strategy</li>
              <li>You receive a percentage ownership interest</li>
            </ul>
            <div className="rounded-[24px] border border-ap-border bg-ap-panel px-5 py-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ap-muted">Current offering</p>
              <h3 className="mt-3 font-serif text-2xl text-ap-ink">
                Access Properties Real Estate Diversified Income Fund I
              </h3>
            </div>
          </StepCard>
        );
      case "accreditation":
        return (
          <StepCard
            eyebrow="Accreditation"
            title="Do you meet at least one SEC accredited investor criterion?"
            className="mx-auto max-w-4xl"
            footer={renderFooter()}
          >
            <div className="rounded-[24px] border border-ap-border bg-ap-panel px-5 py-6 text-base leading-8 text-ap-muted">
              <p>Annual income over $200,000 or $300,000 with spouse, OR</p>
              <p>Net worth over $1 million excluding primary home</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <OptionButton
                title="Yes, I am accredited"
                centered
                className="min-h-[68px]"
                selected={onboardingData.accreditationStatus === "accredited"}
                onClick={() => setAnswer("accreditationStatus", "accredited")}
              />
              <OptionButton
                title="No, not yet"
                centered
                className="min-h-[68px]"
                selected={onboardingData.accreditationStatus === "non-accredited"}
                onClick={() => setAnswer("accreditationStatus", "non-accredited")}
              />
            </div>
            <button
              type="button"
              onClick={() => setShowAccreditationDetails((prev) => !prev)}
              className="text-sm font-medium text-ap-teal underline underline-offset-4"
            >
              View accreditation details
            </button>
            {showAccreditationDetails ? (
              <div className="rounded-[22px] border border-ap-border bg-white px-5 py-5 text-base leading-7 text-ap-muted shadow-sm">
                Accredited investor status can depend on income, net worth, licenses, entity structure, or other
                qualifying criteria under applicable SEC rules. Final eligibility should always be confirmed through the
                official verification process and offering materials.
              </div>
            ) : null}
            {onboardingData.accreditationStatus === "accredited" ? (
              <div className="rounded-[22px] border border-ap-teal/20 bg-ap-teal/5 px-5 py-5 text-base leading-7 text-ap-muted">
                You’ll be able to invest directly through Access Properties after onboarding is complete.
              </div>
            ) : null}
            {onboardingData.accreditationStatus === "non-accredited" ? (
              <div className="rounded-[22px] border border-ap-border bg-ap-panel px-5 py-5 text-base leading-7 text-ap-muted">
                You’ll complete your onboarding here, and then be guided to our equity crowdfunding partner to finalize
                your investment.
              </div>
            ) : null}
          </StepCard>
        );
      case "next":
        return (
          <StepCard
            eyebrow="Next Steps"
            title={isAccredited ? "Your pending Investor Dashboard is the next stop" : "Here’s what happens next"}
            className="mx-auto max-w-4xl"
            footer={renderFooter()}
          >
            <div className="grid gap-3">
              {nextStepsItems.map((item, index) => (
                <div key={item} className="flex items-start gap-4 rounded-[22px] border border-ap-border bg-ap-panel px-5 py-5">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-ap-teal text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <span className="pt-1 text-base leading-7 text-ap-ink">{item}</span>
                </div>
              ))}
            </div>
          </StepCard>
        );
      case "final":
        return (
          <StepCard
            eyebrow="Confirmation"
            title={`You’re all set${firstName ? `, ${firstName}` : ""}.`}
            description="Please check your email for your Access Properties welcome letter, with important details to help you get started."
            className="mx-auto max-w-4xl"
            footer={
              <PrimaryButton
                onClick={() =>
                  navigate("/dashboard", {
                    state: {
                      onboardingData,
                    },
                  })
                }
              >
                Go to Investor Dashboard
              </PrimaryButton>
            }
          >
            <div className="rounded-[24px] border border-ap-border bg-ap-panel px-5 py-6 text-base leading-8 text-ap-muted">
              We’ve saved your responses locally for this prototype. The next version can connect this flow directly to
              Laravel endpoints for profile creation, verification, and dashboard activation.
            </div>
          </StepCard>
        );
      default:
        return null;
    }
  })();

  return (
    <OnboardingLayout
      currentStep={faqMode ? findStepIndex("explore") : currentStepIndex}
      steps={onboardingSteps}
      showBack={currentStepIndex > 0 || faqMode}
      onBack={handleBack}
      aside={!faqMode && currentStepIndex >= findStepIndex("profile") ? aside : null}
    >
      {stepContent}
    </OnboardingLayout>
  );
}
