import React from "react";
import BackButton from "./BackButton.jsx";
import ProgressDots from "./ProgressDots.jsx";

export default function OnboardingLayout({
  currentStep,
  steps,
  showBack = false,
  onBack,
  children,
  aside,
}) {
  return (
    <div className="min-h-screen bg-ap-cream px-4 py-6 text-ap-ink sm:px-6 sm:py-8 lg:px-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-0 h-[420px] w-[420px] rounded-full bg-white/35 blur-3xl" />
        <div className="absolute right-[-8%] top-[12%] h-[360px] w-[360px] rounded-full bg-ap-beige/25 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-[1420px]">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.42em] text-ap-muted">Access Properties</p>
            <h2 className="mt-3 font-serif text-4xl leading-none text-[#2f3f44] sm:text-6xl">Investor Onboarding</h2>
          </div>
          {showBack ? <BackButton onClick={onBack}>Back</BackButton> : <div />}
        </div>

        <ProgressDots currentStep={currentStep} steps={steps} />

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div>{children}</div>
          {aside ? <div className="lg:sticky lg:top-8">{aside}</div> : null}
        </div>
      </div>
    </div>
  );
}
