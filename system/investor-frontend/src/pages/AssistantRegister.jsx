import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Shell from "../components/Shell";
import { api } from "../lib/api";

const introMessage =
  "Welcome to Access Properties - I'm your personal investing assistant. " +
  "I'll guide you through a few steps to create your investor profile. Not financial advice.";

const steps = [
  {
    key: "__ready",
    prompt:
      "Before we start, here's the overall journey:\n" +
      "1) Create your investor profile\n" +
      "2) Confirm eligibility\n" +
      "3) Choose your fund portfolio\n" +
      "4) Verify accredited status (if applicable)\n" +
      "5) Receive funding instructions (if applicable)\n" +
      "6) Access your Investor Dashboard\n\n" +
      "Ready to begin?",
    choices: [
      { label: "Yes, let's start", value: "start", next: "__profile_intro" },
      { label: "I want to learn more first", value: "learn_more", next: "__learn_more" }
    ],
    validate: () => true
  },
  {
    key: "__learn_more",
    prompt:
      "Access Properties is a fund-based real estate investment platform. You invest into a real estate fund (not a single property).\n\n" +
      "When you're ready, tap 'Yes, let's start'.",
    choices: [{ label: "Yes, let's start", value: "start", next: "__profile_intro" }],
    validate: () => true
  },
  {
    key: "__profile_intro",
    prompt:
      "First, let's set up your investor profile so I can personalize your experience and save your progress.",
    autoAdvance: true,
    validate: () => true
  },
  {
    key: "first_name",
    prompt: "First, what's your first name?",
    validate: (value) => value.trim().length > 0 || "First name is required."
  },
  {
    key: "last_name",
    prompt: "What's your last name?",
    validate: (value) => value.trim().length > 0 || "Last name is required."
  },
  {
    key: "email",
    prompt: "What's your email address?",
    validate: (value) => /\S+@\S+\.\S+/.test(value) || "Please enter a valid email."
  },
  {
    key: "phone",
    prompt: "What's your mobile phone number?",
    validate: (value) => value.trim().length > 6 || "Please enter a valid phone number."
  },
  {
    key: "newsletter_opt_in",
    prompt: "Sign me up for the Access Properties newsletter?",
    choices: [
      { label: "Yes", value: true },
      { label: "No", value: false }
    ],
    validate: () => true
  },
  {
    key: "has_invested_before",
    prompt: "Have you invested in real estate, private investments, or investment funds before?",
    choices: [
      { label: "Yes, I have invested before", value: true, next: "__experience_yes" },
      { label: "No, I am new to investing", value: false, next: "__experience_no" }
    ],
    validate: () => true
  },
  {
    key: "__experience_yes",
    prompt: "Great - I'll keep things efficient.",
    autoAdvance: true,
    validate: () => true
  },
  {
    key: "__experience_no",
    prompt: "No problem - I'll explain terms as we go.",
    autoAdvance: true,
    validate: () => true
  },
  {
    key: "planned_amount_bucket",
    prompt: "How much are you planning to invest right now?",
    choices: [
      { label: "Less than $10,000", value: "LT_10K" },
      { label: "$10,000 or more", value: "GTE_10K" },
      { label: "Not sure yet", value: "NOT_SURE" }
    ],
    validate: () => true
  },
  {
    key: "sec_accredited",
    prompt:
      "To follow SEC rules, do you meet at least ONE Accredited Investor requirement?\n" +
      "- Annual income over $200,000 (or $300,000 with spouse), OR\n" +
      "- Net worth over $1 million (excluding primary home)",
    choices: [
      { label: "Yes", value: "YES" },
      { label: "No", value: "NO" },
      { label: "Not sure", value: "NOT_SURE" }
    ],
    validate: () => true
  },
  {
    key: "investor_track",
    prompt: "Which option best describes what you want?",
    choices: [
      { label: "I want to invest smaller amounts with other investors (crowdfunding)", value: "CROWDFUNDER" },
      { label: "I want to invest directly as an accredited investor", value: "ACCREDITED" }
    ],
    validate: (value, state) => {
      if (state.sec_accredited === "NO" && value === "ACCREDITED") {
        return "Based on your eligibility answer, you should continue via crowdfunding.";
      }
      return true;
    }
  },
  {
    key: "__fund_clarification",
    prompt:
      "Quick clarification before we continue:\n" +
      "Access Properties does not offer property-specific deals. Instead, you invest into a real estate investment fund.\n\n" +
      "Your investment is:\n" +
      "- pooled with other investors\n" +
      "- allocated according to the fund strategy\n" +
      "- represented as a percentage ownership interest in the fund\n\n" +
      "Current offering:\n" +
      "Access Properties Real Estate Diversified Income Fund I (Greater Boston Fund)",
    choices: [
      { label: "Continue", value: "continue", next: "password" },
      { label: "View Portfolios", value: "view_portfolios", next: "__fund_clarification", action: { type: "open", target: "/portfolios" } }
    ],
    validate: () => true
  },
  {
    key: "password",
    prompt: "Create a password (minimum 8 characters).",
    validate: (value) => value.length >= 8 || "Password must be at least 8 characters."
  },
  {
    key: "password_confirmation",
    prompt: "Confirm your password.",
    validate: (value, state) => value === state.password || "Passwords do not match."
  },
  {
    key: "address_line1",
    prompt: "What's your street address?",
    validate: (value) => value.trim().length > 3 || "Please enter your street address."
  },
  {
    key: "address_line2",
    prompt: "Apartment, suite, or unit? (optional)",
    optional: true
  },
  {
    key: "city",
    prompt: "City?",
    validate: (value) => value.trim().length > 1 || "Please enter your city."
  },
  {
    key: "state",
    prompt: "State or province?",
    validate: (value) => value.trim().length > 1 || "Please enter your state."
  },
  {
    key: "postal_code",
    prompt: "ZIP or postal code?",
    validate: (value) => value.trim().length > 2 || "Please enter your postal code."
  },
  {
    key: "country",
    prompt: "Country? (default: USA)",
    optional: true,
    defaultValue: "USA"
  },
  {
    key: "capital_contribution_amount",
    prompt: "How much do you plan to invest (USD)?",
    validate: (value) => {
      const amount = Number(value);
      if (Number.isNaN(amount)) {
        return "Please enter a valid dollar amount.";
      }
      if (amount < 100) {
        return "Please enter an amount of at least $100.";
      }
      return true;
    }
  },
  {
    key: "units_purchased",
    prompt: "How many units do you plan to purchase? (optional, default 0)",
    optional: true,
    defaultValue: 0,
    validate: (value) => {
      if (value === "" || value === null || value === undefined) return true;
      return !Number.isNaN(Number(value)) || "Please enter a valid number.";
    }
  },
  {
    key: "equity_percent",
    prompt: "Estimated equity percent? (optional, default 0)",
    optional: true,
    defaultValue: 0,
    validate: (value) => {
      if (value === "" || value === null || value === undefined) return true;
      return !Number.isNaN(Number(value)) || "Please enter a valid number.";
    }
  }
];

const AssistantRegister = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [input, setInput] = useState("");
  const [answers, setAnswers] = useState({});
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [review, setReview] = useState(false);
  const [serverErrors, setServerErrors] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingQueue = useRef(Promise.resolve());
  const [editIndex, setEditIndex] = useState(null);
  const messageEndRef = useRef(null);
  const navigate = useNavigate();

  const step = steps[currentStep];

  const plannedAmountLabel = useMemo(() => {
    const bucket = answers.planned_amount_bucket;
    if (bucket === "LT_10K") return "Less than $10,000";
    if (bucket === "GTE_10K") return "$10,000 or more";
    if (bucket === "NOT_SURE") return "Not sure yet";
    return null;
  }, [answers.planned_amount_bucket]);

  const getChoiceLabel = (stepKey, value) => {
    const stepDef = steps.find((s) => s.key === stepKey);
    const choice = stepDef?.choices?.find((item) => item.value === value);
    return choice?.label ?? value;
  };

  const typeAssistant = (text) => {
    if (!text) return Promise.resolve();
    setIsTyping(true);
    const id = `a-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setMessages((prev) => [...prev, { id, role: "assistant", text: "" }]);

    return new Promise((resolve) => {
      const chars = String(text).split("");
      let i = 0;
      const tick = () => {
        const nextChar = chars[i] ?? "";
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id !== id) return msg;
            const currentText = msg.text || "";
            return { ...msg, text: currentText + nextChar };
          })
        );
        i += 1;
        if (i < chars.length) {
          setTimeout(tick, 18);
        } else {
          setIsTyping(false);
          resolve();
        }
      };
      setTimeout(tick, 18);
    });
  };

  const enqueueAssistant = (text) => {
    typingQueue.current = typingQueue.current.then(() => typeAssistant(text));
    return typingQueue.current;
  };

  const emitUser = (text) => {
    setMessages((prev) => [...prev, { role: "user", text }]);
  };

  const advanceTo = async (index, options = {}) => {
    const { skipAutoAdvance = false } = options;
    if (index >= steps.length) {
      setReview(true);
      return;
    }
    setCurrentStep(index);
    const nextStep = steps[index];
    await enqueueAssistant(nextStep.prompt);
    if (nextStep.autoAdvance && !skipAutoAdvance) {
      await advanceTo(index + 1, options);
    }
  };

  const goNext = async () => {
    await advanceTo(currentStep + 1);
  };

  const goBack = async () => {
    if (currentStep === 0) return;
    setCurrentStep((prev) => prev - 1);
    setReview(false);
    setError("");
    setInput(answers[steps[currentStep - 1].key] ?? "");
    await enqueueAssistant(`Let's update: ${steps[currentStep - 1].prompt}`);
  };

  const jumpToStep = async (index, reason, editOnly = false) => {
    if (index < 0 || index >= steps.length) return;
    setReview(false);
    setCurrentStep(index);
    setError("");
    setInput(answers[steps[index].key] ?? "");
    setEditIndex(editOnly ? index : null);
    if (reason) {
      await enqueueAssistant(reason);
    }
    await enqueueAssistant(steps[index].prompt);
  };

  const handleSubmitAnswer = () => {
    if (!step) return;
    const value = input.trim();
    const finalValue = value === "" && step.optional ? step.defaultValue ?? "" : value;
    const normalized = step.normalize ? step.normalize(finalValue, answers) : finalValue;
    const validation = step.validate ? step.validate(normalized, answers) : true;
    if (validation !== true) {
      setError(validation);
      return;
    }
    setError("");
    emitUser(value || (step.optional ? "Skipped" : value));
    setAnswers((prev) => ({ ...prev, [step.key]: normalized }));
    setInput("");
    if (editIndex !== null) {
      setEditIndex(null);
      setReview(true);
      enqueueAssistant("Got it. I updated that field. Review your details when you're ready.");
      return;
    }
    goNext();
  };

  const handleChoice = async (choice) => {
    if (!step) return;
    const rawValue = choice.value;
    const normalized = step.normalize ? step.normalize(rawValue, answers) : rawValue;
    const validation = step.validate ? step.validate(normalized, answers) : true;
    if (validation !== true) {
      setError(validation);
      return;
    }
    setError("");
    emitUser(choice.label);
    setAnswers((prev) => ({ ...prev, [step.key]: normalized }));

    if (choice.action?.type === "open" && choice.action?.target) {
      navigate(choice.action.target);
    }

    if (editIndex !== null) {
      setEditIndex(null);
      setReview(true);
      enqueueAssistant("Got it. I updated that field. Review your details when you're ready.");
      return;
    }

    if (choice.next) {
      const targetIndex = steps.findIndex((s) => s.key === choice.next);
      if (targetIndex !== -1) {
        await advanceTo(targetIndex);
        return;
      }
    }

    goNext();
  };

  const handleReviewSubmit = async () => {
    setSubmitting(true);
    setServerErrors(null);
    const payload = {
      ...answers,
      full_name: [answers.first_name, answers.last_name].filter(Boolean).join(" ").trim(),
      capital_contribution_amount: Number(answers.capital_contribution_amount || 0),
      units_purchased: Number(answers.units_purchased || 0),
      equity_percent: Number(answers.equity_percent || 0),
      investor_track: answers.investor_track,
      country: answers.country || "USA"
    };
    try {
      await api.register(payload);
      await enqueueAssistant("All set. Your account is created.");
      navigate("/welcome");
    } catch (err) {
      const errors = err?.response?.data?.errors || { general: err?.response?.data?.message || "Registration failed." };
      setServerErrors(errors);
      if (errors && typeof errors === "object") {
        const fieldKey = Object.keys(errors).find((key) => key !== "general");
        if (fieldKey) {
          const index = steps.findIndex((s) => s.key === fieldKey);
          const message = Array.isArray(errors[fieldKey]) ? errors[fieldKey].join(", ") : String(errors[fieldKey]);
          await jumpToStep(
            index,
            `There's an issue with ${fieldKey.replace(/_/g, " ")}: ${message}. Please re-enter it.`,
            true
          );
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      await enqueueAssistant(introMessage);
      await advanceTo(0);
    };
    if (messages.length === 0) {
      run();
    }
  }, []);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, review]);

  return (
    <Shell hideHeader>
      <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex h-full flex-col rounded-2xl border border-border bg-white shadow-card">
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                      msg.role === "user" ? "bg-ink text-white" : "bg-pearl text-ink"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={messageEndRef} />
              </div>
            </div>

            <div className="border-t border-border p-6">
              {review ? (
                <div className="rounded-xl border border-border p-4">
                  <h3 className="text-sm font-semibold">Review & Submit</h3>
                  <div className="mt-3 grid gap-2 text-sm">
                    {steps.map((s, index) => (
                      <div key={s.key} className="flex items-center justify-between gap-4">
                        <div>
                          <span className="text-slate">{s.key.replace(/_/g, " ")}</span>
                          <span className="ml-3">
                            {s.choices ? (getChoiceLabel(s.key, answers[s.key]) || "-") : (answers[s.key] ?? "-")}
                          </span>
                        </div>
                        {s.key.startsWith("__") ? null : (
                          <button
                            className="rounded-full border border-ink px-3 py-1 text-[10px] uppercase tracking-widest"
                            onClick={() => jumpToStep(index, null, true)}
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    ))}
                    <div className="flex justify-between gap-4">
                      <span className="text-slate">investor_track</span>
                      <span>{answers.investor_track || "-"}</span>
                    </div>
                  </div>
                  {serverErrors ? (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      {serverErrors.general || "Please fix the highlighted fields."}
                      {serverErrors && typeof serverErrors === "object" ? (
                        <ul className="mt-2 list-disc pl-5">
                          {Object.entries(serverErrors).map(([field, messages]) => {
                            if (field === "general") return null;
                            const text = Array.isArray(messages) ? messages.join(", ") : String(messages);
                            return (
                              <li key={field}>
                                <strong>{field}:</strong> {text}
                              </li>
                            );
                          })}
                        </ul>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      className="rounded-full border border-ink px-4 py-2 text-xs uppercase tracking-widest"
                      onClick={goBack}
                    >
                      Back
                    </button>
                    <button
                      className="rounded-full bg-ink px-4 py-2 text-xs uppercase tracking-widest text-white"
                      disabled={submitting}
                      onClick={handleReviewSubmit}
                    >
                      {submitting ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {error ? <div className="mb-3 text-sm text-red-600">{error}</div> : null}
                  {step?.choices ? (
                    <div className="flex flex-wrap gap-3">
                      {step.choices.map((choice) => (
                        <button
                          key={choice.label}
                          className="rounded-full border border-ink px-4 py-2 text-xs uppercase tracking-widest"
                          onClick={() => handleChoice(choice)}
                          disabled={isTyping}
                        >
                          {choice.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <input
                        className="flex-1 rounded-full border border-border px-4 py-3 text-sm"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your answer..."
                        disabled={isTyping}
                        onKeyDown={(e) => (e.key === "Enter" ? handleSubmitAnswer() : null)}
                      />
                      <button
                        className="rounded-full bg-ink px-4 py-3 text-xs uppercase tracking-widest text-white"
                        onClick={handleSubmitAnswer}
                        disabled={isTyping}
                      >
                        Send
                      </button>
                    </div>
                  )}
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      className="rounded-full border border-ink px-4 py-2 text-xs uppercase tracking-widest"
                      onClick={goBack}
                      disabled={currentStep === 0}
                    >
                      Back
                    </button>
                    <div className="text-xs text-slate">Step {currentStep + 1} of {steps.length}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <aside className="h-full rounded-2xl border border-border bg-pearl p-6">
            <h3 className="text-xs uppercase tracking-[0.3em] text-slate">Summary</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div><strong>Investor Track:</strong> {answers.investor_track || "—"}</div>
              <div><strong>Planned Amount:</strong> {plannedAmountLabel || "—"}</div>
              <div><strong>Contribution:</strong> {answers.capital_contribution_amount || "—"}</div>
              <div><strong>Email:</strong> {answers.email || "—"}</div>
            </div>
            <p className="mt-6 text-xs text-slate">
              Not financial advice.
            </p>
          </aside>
        </div>
      </div>
    </Shell>
  );
};

export default AssistantRegister;
