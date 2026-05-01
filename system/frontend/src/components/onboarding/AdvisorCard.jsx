import React from "react";

export default function AdvisorCard({
  name = "Your Access Advisor",
  message = "Hi — I’m your Access Properties advisor. I’ll guide you through your investment setup step by step.",
}) {
  return (
    <div className="rounded-[26px] border border-ap-border bg-white p-5 shadow-float">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ap-beige via-[#f2ebe2] to-ap-teal text-sm font-semibold text-ap-ink">
          AP
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ap-muted">{name}</p>
          <p className="mt-3 text-sm leading-6 text-ap-ink">{message}</p>
        </div>
      </div>
    </div>
  );
}
