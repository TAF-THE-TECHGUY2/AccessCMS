import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

const steps = [
  { id: "amount", title: "Investment Amount" },
  { id: "accredited", title: "Accreditation" },
  { id: "goals", title: "Goals" },
  { id: "result", title: "Result" },
];

const fade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const TypingDots = () => (
  <div className="flex gap-1" aria-hidden="true">
    <span className="h-2 w-2 rounded-full bg-white/60 animate-bounce" />
    <span className="h-2 w-2 rounded-full bg-white/60 animate-bounce [animation-delay:150ms]" />
    <span className="h-2 w-2 rounded-full bg-white/60 animate-bounce [animation-delay:300ms]" />
  </div>
);

const Confetti = () => {
  const pieces = Array.from({ length: 18 });
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {pieces.map((_, index) => (
        <span
          key={index}
          className="absolute top-0 h-3 w-3 rounded-full opacity-70 animate-[confetti_2.6s_ease-in-out_infinite]"
          style={{
            left: `${(index * 5 + 10) % 90}%`,
            animationDelay: `${index * 0.12}s`,
            backgroundColor: index % 2 ? "#b3a17a" : "#f4efe4",
          }}
        />
      ))}
    </div>
  );
};

export default function InvestNowWizard() {
  const [stepIndex, setStepIndex] = useState(0);
  const [amount, setAmount] = useState(100);
  const [accredited, setAccredited] = useState(null);
  const [criteria, setCriteria] = useState({});
  const [goals, setGoals] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const navigate = useNavigate();

  const progress = ((stepIndex + 1) / steps.length) * 100;

  const result = useMemo(() => {
    const amt = Number(amount || 0);
    const accreditedOk = accredited === true && amt >= 10000;
    if (accreditedOk) {
      return { track: "ACCREDITED", min: 10000 };
    }
    return { track: "CROWDFUNDER", min: 100 };
  }, [amount, accredited]);

  const next = () => {
    if (stepIndex < steps.length - 1) setStepIndex((s) => s + 1);
    if (stepIndex === steps.length - 2) setShowConfetti(true);
  };

  const back = () => setStepIndex((s) => Math.max(0, s - 1));

  const canContinue = () => {
    if (steps[stepIndex].id === "amount") return Number(amount) >= 100;
    if (steps[stepIndex].id === "accredited") return accredited !== null;
    return true;
  };

  useEffect(() => {
    sessionStorage.setItem("invest_gate", "true");
  }, []);

  const toggleCriteria = (key) => {
    setCriteria((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-night text-white flex items-center justify-center px-4 py-10">
      <div className="max-w-3xl w-full">
        <div className="flex items-center justify-between text-sm uppercase tracking-[0.3em] text-white/60">
          <span>Invest Now</span>
          <span>{steps[stepIndex].title}</span>
        </div>

        <div className="mt-4 space-y-4">
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full bg-accent" style={{ width: `${progress}%` }} />
          </div>
          <div className="grid grid-cols-4 gap-2 text-xs text-white/60">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center gap-2">
                <span
                  className={clsx(
                    "h-5 w-5 rounded-full flex items-center justify-center text-[10px]",
                    idx <= stepIndex ? "bg-accent text-black" : "bg-white/10 text-white/50"
                  )}
                >
                  {idx + 1}
                </span>
                <span className={clsx(idx <= stepIndex ? "text-white" : "text-white/50")}>{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-white/5 border border-white/10 rounded-3xl p-6 md:p-10 shadow-xl">
          <div className="flex items-center gap-3 text-white/70">
            <TypingDots />
            <span className="text-xs uppercase tracking-widest">Assistant</span>
          </div>

          <AnimatePresence mode="wait">
            {steps[stepIndex].id === "amount" ? (
              <motion.div key="amount" {...fade} className="mt-6 space-y-6">
                <h1 className="text-3xl md:text-4xl font-semibold">How much are you planning to invest?</h1>
                <div className="flex flex-col gap-3">
                  <input
                    type="number"
                    aria-label="Investment amount"
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-lg"
                    value={amount}
                    min={100}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <p className="text-sm text-white/60">Minimum for Crowdfunders is $100.</p>
                </div>
              </motion.div>
            ) : null}

            {steps[stepIndex].id === "accredited" ? (
              <motion.div key="accredited" {...fade} className="mt-6 space-y-6">
                <h1 className="text-3xl md:text-4xl font-semibold">Are you an accredited investor?</h1>
                <div className="grid md:grid-cols-2 gap-4">
                  {[true, false].map((value) => (
                    <button
                      key={String(value)}
                      className={clsx(
                        "rounded-2xl border px-4 py-6 text-left transition",
                        accredited === value
                          ? "border-accent bg-accent/10"
                          : "border-white/10 hover:border-white/30"
                      )}
                      onClick={() => setAccredited(value)}
                    >
                      <div className="text-lg font-semibold">{value ? "Yes" : "No"}</div>
                      <p className="text-sm text-white/70 mt-1">
                        {value
                          ? "I meet accreditation criteria."
                          : "I want to invest via crowdfunding."}
                      </p>
                    </button>
                  ))}
                </div>
                {accredited ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                    <p className="text-sm text-white/70">Select any that apply (for guidance only):</p>
                    {[
                      { key: "income", label: "Income over $200K (or $300K with spouse)" },
                      { key: "netWorth", label: "Net worth over $1M (excluding primary residence)" },
                      { key: "license", label: "Hold a Series 7/65/82 license" },
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-2 text-sm text-white/80">
                        <input
                          type="checkbox"
                          className="accent-accent"
                          checked={Boolean(criteria[item.key])}
                          onChange={() => toggleCriteria(item.key)}
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                ) : null}
              </motion.div>
            ) : null}

            {steps[stepIndex].id === "goals" ? (
              <motion.div key="goals" {...fade} className="mt-6 space-y-6">
                <h1 className="text-3xl md:text-4xl font-semibold">What are your goals?</h1>
                <textarea
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-lg min-h-[140px]"
                  placeholder="Optional: income, growth, timeline..."
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                />
                <p className="text-sm text-white/60">This does not affect eligibility.</p>
              </motion.div>
            ) : null}

            {steps[stepIndex].id === "result" ? (
              <motion.div key="result" {...fade} className="mt-6 space-y-6">
                <h1 className="text-3xl md:text-4xl font-semibold">You qualify for</h1>
                <div className="rounded-2xl border border-accent bg-accent/10 p-5">
                  <div className="flex items-center gap-3 text-2xl font-semibold">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent text-black">
                      ✓
                    </span>
                    {result.track} Track
                  </div>
                  <p className="text-sm text-white/70 mt-2">
                    Minimum investment: ${result.min.toLocaleString()}
                  </p>
                  {accredited && result.track === "CROWDFUNDER" ? (
                    <p className="text-sm text-white/60 mt-2">
                      Your amount is below $10,000, so we&apos;ll continue with the Crowdfunder flow.
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-col md:flex-row gap-3">
                  <button
                    className="bg-white text-black px-6 py-3 rounded-xl font-semibold"
                    onClick={() => navigate("/auth", { state: { mode: "register", amount, track: result.track } })}
                  >
                    Sign up
                  </button>
                  <button
                    className="border border-white/30 px-6 py-3 rounded-xl font-semibold"
                    onClick={() => navigate("/auth", { state: { mode: "login" } })}
                  >
                    Sign in
                  </button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between">
            <button className="text-white/60 hover:text-white" onClick={back} disabled={stepIndex === 0}>
              Back
            </button>
            {steps[stepIndex].id !== "result" ? (
              <button
                className={clsx(
                  "px-6 py-3 rounded-xl font-semibold",
                  canContinue() ? "bg-white text-black" : "bg-white/20 text-white/50 cursor-not-allowed"
                )}
                onClick={next}
                disabled={!canContinue()}
              >
                Continue
              </button>
            ) : null}
          </div>
        </div>

        {showConfetti ? <Confetti /> : null}
      </div>
    </div>
  );
}
