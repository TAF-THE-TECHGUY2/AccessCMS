import React from "react";
import { useNavigate } from "react-router-dom";
import Shell from "../../components/Shell";

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <Shell>
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-semibold">Welcome to the Investor Portal</h1>
        <p className="text-sm text-slate">
          We’ll guide you through a regulated onboarding process so we can determine eligibility and
          provide funding instructions once you’re approved.
        </p>
        <button
          className="rounded-full bg-ink px-6 py-3 text-xs uppercase tracking-widest text-white"
          onClick={() => navigate("/onboarding")}
        >
          Start Onboarding
        </button>
      </div>
    </Shell>
  );
};

export default WelcomePage;
