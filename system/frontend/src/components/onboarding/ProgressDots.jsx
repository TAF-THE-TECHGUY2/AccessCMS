import React from "react";

export default function ProgressDots({ currentStep, steps }) {
  return (
    <div className="rounded-[32px] border border-ap-border bg-white/90 p-5 shadow-float backdrop-blur sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-ap-muted">Onboarding Progress</p>
          <p className="mt-3 font-serif text-2xl text-ap-ink sm:text-3xl">{steps[currentStep]?.label}</p>
        </div>
        <p className="text-sm text-ap-muted sm:text-base">
          Step {currentStep + 1} of {steps.length}
        </p>
      </div>
      <div className="mt-7 flex gap-3 overflow-hidden">
        {steps.map((step, index) => {
          const state = index < currentStep ? "bg-ap-teal border-ap-teal" : index === currentStep ? "bg-ap-beige border-[#a79a89]" : "bg-white border-ap-border";
          return (
            <div
              key={step.id}
              className={`h-4 flex-1 rounded-full border ${state}`}
              aria-hidden="true"
            />
          );
        })}
      </div>
    </div>
  );
}
