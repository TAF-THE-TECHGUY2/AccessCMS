import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Shell from "../../components/Shell";
import { useOnboarding } from "../../lib/onboarding";

const questions = [
  { key: "income_200k", label: "I have an annual income over $200k (or $300k with spouse)." },
  { key: "net_worth_1m", label: "My net worth exceeds $1M (excluding primary residence)." },
  { key: "professional_cert", label: "I hold a qualifying professional certification." },
  { key: "entity_5m", label: "I represent an entity with assets over $5M." },
];

const SECScreening = () => {
  const { saveSec } = useOnboarding();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    const eligible = Object.values(answers).some(Boolean);
    if (!eligible) {
      setError("Select at least one eligibility rule.");
      return;
    }
    try {
      await saveSec({ answers });
      navigate("/onboarding/pathway");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save.");
    }
  };

  return (
    <Shell>
      <div className="mx-auto max-w-2xl space-y-6">
        <h2 className="text-2xl font-semibold">SEC Eligibility Screening</h2>
        <form className="space-y-4" onSubmit={submit}>
          {questions.map((q) => (
            <label key={q.key} className="flex items-start gap-3 rounded-lg border border-border p-4">
              <input
                type="checkbox"
                checked={!!answers[q.key]}
                onChange={(e) => setAnswers({ ...answers, [q.key]: e.target.checked })}
              />
              <span className="text-sm">{q.label}</span>
            </label>
          ))}
          {error ? <div className="text-sm text-red-600">{error}</div> : null}
          <button className="rounded-full bg-ink px-6 py-3 text-xs uppercase tracking-widest text-white">
            Continue
          </button>
        </form>
      </div>
    </Shell>
  );
};

export default SECScreening;
