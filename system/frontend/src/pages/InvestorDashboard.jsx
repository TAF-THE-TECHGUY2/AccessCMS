import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function InvestorDashboard() {
  const { state } = useLocation();
  const onboardingData = state?.onboardingData;
  const firstName = onboardingData?.profile?.firstName || "Investor";
  const isAccredited = onboardingData?.accreditationStatus === "accredited";

  return (
    <div className="min-h-screen bg-ap-cream px-4 py-8 text-ap-ink sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-[28px] bg-white p-6 shadow-calm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-ap-muted">Investor Dashboard</p>
          <h1 className="mt-4 font-serif text-4xl text-ap-ink">Welcome, {firstName}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-ap-muted">
            This is a frontend-ready dashboard destination for the onboarding prototype. It’s structured so real data,
            verification states, and document modules can be connected to Laravel later.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-[28px] bg-white p-6 shadow-calm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-ap-muted">Next Actions</p>
            <div className="mt-5 grid gap-3">
              {(isAccredited
                ? [
                    "Identity verification pending",
                    "Funding instructions will appear here",
                    "Investment activates once funds are received",
                    "Documents and communications will populate here",
                  ]
                : [
                    "Identity verification pending",
                    "Crowdfunding partner link will appear after approval",
                    "Documents and communications will populate here",
                  ]
              ).map((item, index) => (
                <div key={item} className="flex items-start gap-4 rounded-2xl border border-ap-beige/60 bg-[#FCFAF7] px-4 py-4">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-ap-teal text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <span className="pt-1 text-sm leading-6 text-ap-ink">{item}</span>
                </div>
              ))}
            </div>
          </section>

          <aside className="rounded-[28px] bg-white p-6 shadow-calm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-ap-muted">Prototype Summary</p>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-ap-muted">Offering</dt>
                <dd className="mt-1 font-medium text-ap-ink">Access Properties Real Estate Diversified Income Fund I</dd>
              </div>
              <div>
                <dt className="text-ap-muted">Experience</dt>
                <dd className="mt-1 font-medium capitalize text-ap-ink">
                  {onboardingData?.experienceLevel || "Not provided"}
                </dd>
              </div>
              <div>
                <dt className="text-ap-muted">Amount</dt>
                <dd className="mt-1 font-medium text-ap-ink">{onboardingData?.amountRange || "Not provided"}</dd>
              </div>
              <div>
                <dt className="text-ap-muted">Investor path</dt>
                <dd className="mt-1 font-medium text-ap-ink">{isAccredited ? "Accredited" : "Non-accredited"}</dd>
              </div>
            </dl>
            <Link
              to="/invest-now"
              className="mt-6 inline-flex items-center justify-center rounded-xl border border-ap-beige/80 bg-[#FCFAF7] px-5 py-3 text-sm font-medium text-ap-ink transition hover:border-ap-teal/40 hover:text-ap-teal"
            >
              Start again
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
