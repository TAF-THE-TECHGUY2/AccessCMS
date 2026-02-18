import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Shell from "../components/Shell";
import { api } from "../lib/api";

const introMessage = "Hi! I’ll help you complete your investor application. I’ll ask a few short questions to populate your registration form.";

const steps = [
  {
    key: "full_name",
    prompt: "What’s your full legal name?",
    validate: (value) => value.trim().length > 1 || "Please enter your full name."
  },
  {
    key: "title",
    prompt: "Do you have a title? (e.g., CEO, Manager). You can leave this blank.",
    optional: true
  },
  {
    key: "phone",
    prompt: "What’s the best phone number to reach you?",
    validate: (value) => value.trim().length > 6 || "Please enter a valid phone number."
  },
  {
    key: "email",
    prompt: "What’s your email address?",
    validate: (value) => /\S+@\S+\.\S+/.test(value) || "Please enter a valid email."
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
    prompt: "What’s your street address?",
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
        return "Crowdfunder minimum is $100. Please enter a higher amount.";
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

  const investorTrack = useMemo(() => {
    const amount = Number(answers.capital_contribution_amount || 0);
    return amount >= 10000 ? "ACCREDITED" : "CROWDFUNDER";
  }, [answers.capital_contribution_amount]);

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

  const goNext = async () => {
    if (currentStep + 1 >= steps.length) {
      setReview(true);
      return;
    }
    setCurrentStep((prev) => prev + 1);
    await enqueueAssistant(steps[currentStep + 1].prompt);
  };

  const goBack = async () => {
    if (currentStep === 0) return;
    setCurrentStep((prev) => prev - 1);
    setReview(false);
    setError("");
    setInput(answers[steps[currentStep - 1].key] ?? "");
    await enqueueAssistant(`Let’s update: ${steps[currentStep - 1].prompt}`);
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
    const validation = step.validate ? step.validate(finalValue, answers) : true;
    if (validation !== true) {
      setError(validation);
      return;
    }
    setError("");
    emitUser(value || (step.optional ? "Skipped" : value));
    setAnswers((prev) => ({ ...prev, [step.key]: finalValue }));
    setInput("");
    if (editIndex !== null) {
      setEditIndex(null);
      setReview(true);
      enqueueAssistant("Got it. I updated that field. Review your details when you’re ready.");
      return;
    }
    goNext();
  };

  const handleReviewSubmit = async () => {
    setSubmitting(true);
    setServerErrors(null);
    const payload = {
      ...answers,
      capital_contribution_amount: Number(answers.capital_contribution_amount || 0),
      units_purchased: Number(answers.units_purchased || 0),
      equity_percent: Number(answers.equity_percent || 0),
      investor_track: investorTrack,
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
            `There’s an issue with ${fieldKey.replace(/_/g, " ")}: ${message}. Please re-enter it.`,
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
      await enqueueAssistant(steps[0].prompt);
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
                      <span className="ml-3">{answers[s.key] ?? "-"}</span>
                    </div>
                    <button
                      className="rounded-full border border-ink px-3 py-1 text-[10px] uppercase tracking-widest"
                      onClick={() => jumpToStep(index, null, true)}
                    >
                      Edit
                    </button>
                  </div>
                ))}
                <div className="flex justify-between gap-4">
                  <span className="text-slate">investor_track</span>
                  <span>{investorTrack}</span>
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
            <div><strong>Investor Track:</strong> {investorTrack}</div>
            <div><strong>Contribution:</strong> {answers.capital_contribution_amount || "—"}</div>
            <div><strong>Email:</strong> {answers.email || "—"}</div>
          </div>
          <p className="mt-6 text-xs text-slate">
            Anything below $10,000 is automatically classified as Crowdfunder. $10,000 or above is Accredited.
          </p>
        </aside>
        </div>
      </div>
    </Shell>
  );
};

export default AssistantRegister;
