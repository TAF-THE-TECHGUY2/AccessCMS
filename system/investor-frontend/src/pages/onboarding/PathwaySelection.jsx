import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Shell from "../../components/Shell";
import { useOnboarding } from "../../lib/onboarding";

const PathwaySelection = () => {
  const { savePathway, state } = useOnboarding();
  const navigate = useNavigate();
  const [pathway, setPathway] = useState("crowdfunding");
  const [error, setError] = useState("");
  const lockedPathway = state?.pathway?.pathway || null;

  const pathwayLabel = useMemo(() => {
    if (lockedPathway === "accredited") return "Accredited Investor";
    if (lockedPathway === "crowdfunding") return "Crowdfunding";
    return null;
  }, [lockedPathway]);

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    if (lockedPathway) {
      navigate("/onboarding/profile");
      return;
    }

    try {
      await savePathway({ pathway });
      navigate("/onboarding/profile");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save.");
    }
  };

  return (
    <Shell>
      <div className="mx-auto max-w-xl space-y-6">
        <h2 className="text-2xl font-semibold">
          {lockedPathway ? "Your pathway is already set" : "Select Your Pathway"}
        </h2>
        <form className="space-y-4" onSubmit={submit}>
          {lockedPathway ? (
            <div className="rounded-xl border border-border bg-pearl p-4">
              <p className="text-sm text-slate">
                The assistant already determined your pathway based on your eligibility answers.
              </p>
              <p className="mt-3 text-lg font-semibold text-ink">{pathwayLabel}</p>
            </div>
          ) : (
            <div className="grid gap-3">
              <button
                type="button"
                className={`rounded-xl border px-4 py-4 text-left ${pathway === "crowdfunding" ? "border-ink bg-ink text-white" : "border-border"}`}
                onClick={() => setPathway("crowdfunding")}
              >
                Crowdfunding
              </button>
              <button
                type="button"
                className={`rounded-xl border px-4 py-4 text-left ${pathway === "accredited" ? "border-ink bg-ink text-white" : "border-border"}`}
                onClick={() => setPathway("accredited")}
              >
                Accredited Investor
              </button>
            </div>
          )}
          {error ? <div className="text-sm text-red-600">{error}</div> : null}
          <button className="rounded-full bg-ink px-6 py-3 text-xs uppercase tracking-widest text-white">
            Continue
          </button>
        </form>
      </div>
    </Shell>
  );
};

export default PathwaySelection;
