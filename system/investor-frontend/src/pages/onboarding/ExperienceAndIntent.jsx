import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Shell from "../../components/Shell";
import { useOnboarding } from "../../lib/onboarding";

const ExperienceAndIntent = () => {
  const { saveExperience } = useOnboarding();
  const navigate = useNavigate();
  const [investedBefore, setInvestedBefore] = useState(false);
  const [plannedAmount, setPlannedAmount] = useState("<10k");
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await saveExperience({ invested_before: investedBefore, planned_amount: plannedAmount });
      navigate("/onboarding/sec");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save.");
    }
  };

  return (
    <Shell>
      <div className="mx-auto max-w-xl space-y-6">
        <h2 className="text-2xl font-semibold">Experience & Intent</h2>
        <form className="space-y-4" onSubmit={submit}>
          <div>
            <label className="text-xs uppercase tracking-widest text-slate">Invested before?</label>
            <div className="mt-2 flex gap-4">
              <button
                type="button"
                className={`rounded-full border px-4 py-2 text-xs uppercase tracking-widest ${investedBefore ? "border-ink bg-ink text-white" : "border-border"}`}
                onClick={() => setInvestedBefore(true)}
              >
                Yes
              </button>
              <button
                type="button"
                className={`rounded-full border px-4 py-2 text-xs uppercase tracking-widest ${!investedBefore ? "border-ink bg-ink text-white" : "border-border"}`}
                onClick={() => setInvestedBefore(false)}
              >
                No
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-slate">Planned amount</label>
            <select
              className="mt-2 w-full rounded-lg border border-border px-4 py-3"
              value={plannedAmount}
              onChange={(e) => setPlannedAmount(e.target.value)}
            >
              <option value="<10k">Below $10,000</option>
              <option value=">=10k">$10,000 or more</option>
              <option value="unsure">Not sure</option>
            </select>
          </div>
          {error ? <div className="text-sm text-red-600">{error}</div> : null}
          <button className="rounded-full bg-ink px-6 py-3 text-xs uppercase tracking-widest text-white">
            Continue
          </button>
        </form>
      </div>
    </Shell>
  );
};

export default ExperienceAndIntent;
