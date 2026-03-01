import React, { useEffect, useMemo, useRef, useState } from "react";
import Shell from "../../components/Shell";
import { useOnboarding } from "../../lib/onboarding";
import { api } from "../../lib/api";

const steps = [
  { key: "basic", label: "Basic Profile" },
  { key: "experience", label: "Experience & Intent" },
  { key: "sec", label: "SEC Screening" },
  { key: "pathway", label: "Pathway" },
  { key: "profile", label: "Full Profile" },
  { key: "documents", label: "Documents" },
  { key: "accreditation", label: "Accreditation", conditional: "accredited" },
  { key: "status", label: "Review Status" },
  { key: "funding", label: "Funding" },
  { key: "dashboard", label: "Dashboard" }
];

const OnboardingWizardFlow = () => {
  const {
    state,
    saveBasic,
    saveExperience,
    saveSec,
    savePathway,
    saveProfile,
    uploadDocument,
    saveAccreditation,
    fetchStatus,
    fetchFunding
  } = useOnboarding();

  const [current, setCurrent] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [approvedNotice, setApprovedNotice] = useState(false);
  const [status, setStatus] = useState({ status: "pending", rejection_reason: "" });
  const [funding, setFunding] = useState(null);
  const [dashboard, setDashboard] = useState({
    profile: null,
    investments: [],
    payments: [],
    external_purchases: [],
    portfolio_allocations: []
  });
  const [offerings, setOfferings] = useState([]);
  const successTimer = useRef(null);

  const visibleSteps = useMemo(() => {
    return steps.filter((step) => {
      if (step.conditional === "accredited") {
        return state?.pathway?.pathway === "accredited";
      }
      return true;
    });
  }, [state?.pathway?.pathway]);

  const goNext = () => setCurrent((prev) => Math.min(prev + 1, visibleSteps.length - 1));
  const goBack = () => setCurrent((prev) => Math.max(prev - 1, 0));

  const step = visibleSteps[current];

  const flashSuccess = (message) => {
    setSuccess(message);
    if (successTimer.current) {
      clearTimeout(successTimer.current);
    }
    successTimer.current = setTimeout(() => {
      setSuccess("");
    }, 2500);
  };

  useEffect(() => {
    if (step?.key === "status") {
      fetchStatus().then(setStatus).catch(() => {});
    }
    if (step?.key === "funding") {
      fetchFunding().then(setFunding).catch(() => {});
      api.investorDashboard().then(setDashboard).catch(() => {});
      api.getOfferings().then((data) => setOfferings(data.offerings || [])).catch(() => {});
    }
    if (step?.key === "dashboard") {
      api.investorDashboard().then(setDashboard).catch(() => {});
    }
  }, [step?.key]);

  useEffect(() => {
    if (step?.key !== "dashboard") return;
    const interval = setInterval(() => {
      api.investorDashboard().then(setDashboard).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, [step?.key]);

  useEffect(() => {
    if (step?.key !== "funding") return;
    const approved = (dashboard?.payments || []).some((payment) => payment.status === "approved");
    if (approved) {
      setApprovedNotice(true);
    }
  }, [dashboard?.payments, step?.key]);

  return (
    <Shell>
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-2xl border border-border bg-pearl p-6">
          <h3 className="text-xs uppercase tracking-[0.3em] text-slate">Onboarding</h3>
          <nav className="mt-6 space-y-2 text-sm">
            {visibleSteps.map((s, idx) => (
              <button
                key={s.key}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left ${
                  idx === current ? "bg-ink text-white" : "text-ink"
                }`}
                onClick={() => setCurrent(idx)}
              >
                <span>{s.label}</span>
                <span className="text-xs opacity-60">{idx + 1}</span>
              </button>
            ))}
          </nav>
        </aside>

        <section className="rounded-2xl border border-border bg-white p-8 shadow-card">
          {error ? <div className="mb-4 text-sm text-red-600">{error}</div> : null}
          {success ? <div className="mb-4 text-sm text-emerald-700">{success}</div> : null}
          {approvedNotice ? (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              Funding confirmed. Your payment was approved.
              <button
                className="ml-3 rounded-full border border-emerald-400 px-3 py-1 text-[10px] uppercase tracking-widest"
                onClick={() => {
                  setApprovedNotice(false);
                  setCurrent(visibleSteps.findIndex((item) => item.key === "dashboard"));
                }}
              >
                Go to Dashboard
              </button>
            </div>
          ) : null}

          {step.key === "basic" && (
            <BasicStep
              initial={state.basic}
              onSubmit={async (payload) => {
                setError("");
                setSuccess("");
                try {
                  await saveBasic(payload);
                  flashSuccess("Saved successfully.");
                  goNext();
                } catch (err) {
                  setError(err?.response?.data?.message || "Unable to save.");
                }
              }}
            />
          )}

          {step.key === "experience" && (
            <ExperienceStep
              initial={state.experience}
              onSubmit={async (payload) => {
                setError("");
                setSuccess("");
                try {
                  await saveExperience(payload);
                  flashSuccess("Saved successfully.");
                  goNext();
                } catch (err) {
                  setError(err?.response?.data?.message || "Unable to save.");
                }
              }}
            />
          )}

          {step.key === "sec" && (
            <SecStep
              initial={state.sec}
              onSubmit={async (payload) => {
                setError("");
                setSuccess("");
                try {
                  await saveSec(payload);
                  flashSuccess("Saved successfully.");
                  goNext();
                } catch (err) {
                  setError(err?.response?.data?.message || "Unable to save.");
                }
              }}
            />
          )}

          {step.key === "pathway" && (
            <PathwayStep
              initial={state.pathway}
              onSubmit={async (payload) => {
                setError("");
                setSuccess("");
                try {
                  await savePathway(payload);
                  flashSuccess("Saved successfully.");
                  goNext();
                } catch (err) {
                  setError(err?.response?.data?.message || "Unable to save.");
                }
              }}
            />
          )}

          {step.key === "profile" && (
            <ProfileStep
              initial={state.profile}
              onSubmit={async (payload) => {
                setError("");
                setSuccess("");
                try {
                  await saveProfile(payload);
                  flashSuccess("Saved successfully.");
                  goNext();
                } catch (err) {
                  setError(err?.response?.data?.message || "Unable to save.");
                }
              }}
            />
          )}

          {step.key === "documents" && (
            <DocumentsStep
              onSubmit={async (payload) => {
                setError("");
                setSuccess("");
                try {
                  await uploadDocument(payload);
                  flashSuccess("Upload successful.");
                  goNext();
                } catch (err) {
                  setError(err?.response?.data?.message || "Upload failed.");
                }
              }}
            />
          )}

          {step.key === "accreditation" && (
            <AccreditationStep
              onSubmit={async (payload) => {
                setError("");
                setSuccess("");
                try {
                  await saveAccreditation(payload);
                  flashSuccess("Saved successfully.");
                  goNext();
                } catch (err) {
                  setError(err?.response?.data?.message || "Unable to save.");
                }
              }}
            />
          )}

          {step.key === "status" && (
            <StatusStep status={status} />
          )}

          {step.key === "funding" && (
            <FundingStep
              data={funding}
              investments={dashboard?.investments || []}
              payments={dashboard?.payments || []}
              externalPurchases={dashboard?.external_purchases || []}
              portfolioAllocations={dashboard?.portfolio_allocations || []}
              offerings={offerings}
              onCreateInvestment={async (payload) => {
                setError("");
                setSuccess("");
                try {
                  const created = await api.createInvestment(payload);
                  setDashboard((prev) => ({
                    ...prev,
                    investments: [...(prev.investments || []), created.investment],
                  }));
                  flashSuccess("Investment created.");
                } catch (err) {
                  setError(err?.response?.data?.message || "Unable to create investment.");
                }
              }}
              onCreateExternalPurchase={async (payload) => {
                setError("");
                setSuccess("");
                try {
                  const created = await api.createCrowdfunderPurchase(payload);
                  api.investorDashboard().then(setDashboard).catch(() => {});
                  flashSuccess("Purchase started. Continue on Wefunder.");
                  if (created?.redirect_url) {
                    window.open(created.redirect_url, "_blank", "noopener");
                  }
                } catch (err) {
                  setError(err?.response?.data?.message || "Unable to start purchase.");
                }
              }}
              onUpload={async (payload) => {
                setError("");
                setSuccess("");
                try {
                  await api.uploadPaymentProof(payload);
                  api.investorDashboard().then(setDashboard).catch(() => {});
                  flashSuccess("Proof of payment submitted.");
                } catch (err) {
                  setError(err?.response?.data?.message || "Upload failed.");
                }
              }}
              onUploadExternalProof={async (purchaseId, payload) => {
                setError("");
                setSuccess("");
                try {
                  await api.uploadCrowdfunderProof(purchaseId, payload);
                  api.investorDashboard().then(setDashboard).catch(() => {});
                  flashSuccess("Shares confirmation submitted.");
                } catch (err) {
                  setError(err?.response?.data?.message || "Upload failed.");
                }
              }}
            />
          )}

          {step.key === "dashboard" && (
            <DashboardStep state={state} dashboard={dashboard} />
          )}

          <div className="mt-8 flex items-center justify-between">
            <button
              className="rounded-full border border-ink px-4 py-2 text-xs uppercase tracking-widest"
              onClick={goBack}
              disabled={current === 0}
            >
              Back
            </button>
            <button
              className="rounded-full bg-ink px-4 py-2 text-xs uppercase tracking-widest text-white"
              onClick={goNext}
              disabled={current === visibleSteps.length - 1}
            >
              Next
            </button>
          </div>
        </section>
      </div>
    </Shell>
  );
};

const BasicStep = ({ initial, onSubmit }) => {
  const [form, setForm] = useState(initial || { first_name: "", last_name: "", email: "", phone: "" });
  return (
    <div>
      <h2 className="text-2xl font-semibold">Basic Information</h2>
      <div className="mt-4 grid gap-4">
        {["first_name", "last_name", "email", "phone"].map((field) => (
          <div key={field}>
            <label className="text-xs uppercase tracking-widest text-slate">{field.replace("_", " ")}</label>
            <input
              className="mt-2 w-full rounded-lg border border-border px-4 py-3"
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            />
          </div>
        ))}
        <button className="rounded-full bg-ink px-6 py-3 text-xs uppercase tracking-widest text-white" onClick={() => onSubmit(form)}>
          Save & Continue
        </button>
      </div>
    </div>
  );
};

const ExperienceStep = ({ initial, onSubmit }) => {
  const [investedBefore, setInvestedBefore] = useState(initial?.invested_before ?? false);
  const [plannedAmount, setPlannedAmount] = useState(initial?.planned_amount ?? "<10k");
  return (
    <div>
      <h2 className="text-2xl font-semibold">Experience & Intent</h2>
      <div className="mt-4 grid gap-4">
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
        <button className="rounded-full bg-ink px-6 py-3 text-xs uppercase tracking-widest text-white" onClick={() => onSubmit({ invested_before: investedBefore, planned_amount: plannedAmount })}>
          Save & Continue
        </button>
      </div>
    </div>
  );
};

const SecStep = ({ initial, onSubmit }) => {
  const [answers, setAnswers] = useState(initial?.answers || {});
  const questions = [
    { key: "income_200k", label: "I have an annual income over $200k (or $300k with spouse)." },
    { key: "net_worth_1m", label: "My net worth exceeds $1M (excluding primary residence)." },
    { key: "professional_cert", label: "I hold a qualifying professional certification." },
    { key: "entity_5m", label: "I represent an entity with assets over $5M." }
  ];
  return (
    <div>
      <h2 className="text-2xl font-semibold">SEC Eligibility Screening</h2>
      <div className="mt-4 grid gap-3">
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
        <button className="rounded-full bg-ink px-6 py-3 text-xs uppercase tracking-widest text-white" onClick={() => onSubmit({ answers })}>
          Save & Continue
        </button>
      </div>
    </div>
  );
};

const PathwayStep = ({ initial, onSubmit }) => {
  const [pathway, setPathway] = useState(initial?.pathway ?? "crowdfunding");
  return (
    <div>
      <h2 className="text-2xl font-semibold">Select Your Pathway</h2>
      <div className="mt-4 grid gap-3">
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
        <button className="rounded-full bg-ink px-6 py-3 text-xs uppercase tracking-widest text-white" onClick={() => onSubmit({ pathway })}>
          Save & Continue
        </button>
      </div>
    </div>
  );
};

const ProfileStep = ({ initial, onSubmit }) => {
  const [form, setForm] = useState(initial || { address: "", city: "", country: "USA", postal_code: "", date_of_birth: "" });
  return (
    <div>
      <h2 className="text-2xl font-semibold">Profile Details</h2>
      <div className="mt-4 grid gap-4">
        {["address", "city", "country", "postal_code", "date_of_birth"].map((field) => (
          <div key={field}>
            <label className="text-xs uppercase tracking-widest text-slate">{field.replace("_", " ")}</label>
            <input
              className="mt-2 w-full rounded-lg border border-border px-4 py-3"
              type={field === "date_of_birth" ? "date" : "text"}
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            />
          </div>
        ))}
        <button className="rounded-full bg-ink px-6 py-3 text-xs uppercase tracking-widest text-white" onClick={() => onSubmit(form)}>
          Save & Continue
        </button>
      </div>
    </div>
  );
};

const DocumentsStep = ({ onSubmit }) => {
  const [type, setType] = useState("id");
  const [file, setFile] = useState(null);
  return (
    <div>
      <h2 className="text-2xl font-semibold">Upload Identification</h2>
      <div className="mt-4 grid gap-4">
        <div>
          <label className="text-xs uppercase tracking-widest text-slate">Document Type</label>
          <select className="mt-2 w-full rounded-lg border border-border px-4 py-3" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="id">Government ID</option>
            <option value="passport">Passport</option>
          </select>
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-slate">Upload File</label>
          <input className="mt-2 w-full" type="file" onChange={(e) => setFile(e.target.files[0])} />
        </div>
        <button
          className="rounded-full bg-ink px-6 py-3 text-xs uppercase tracking-widest text-white"
          onClick={() => {
            const form = new FormData();
            form.append("type", type);
            if (file) form.append("file", file);
            onSubmit(form);
          }}
        >
          Save & Continue
        </button>
      </div>
    </div>
  );
};

const AccreditationStep = ({ onSubmit }) => {
  const [method, setMethod] = useState("external");
  const [verificationCode, setVerificationCode] = useState("");
  const [file, setFile] = useState(null);
  return (
    <div>
      <h2 className="text-2xl font-semibold">Accredited Verification</h2>
      <div className="mt-4 grid gap-4">
        <button
          type="button"
          className={`rounded-xl border px-4 py-4 text-left ${method === "external" ? "border-ink bg-ink text-white" : "border-border"}`}
          onClick={() => setMethod("external")}
        >
          External verification (mock Verify.com)
        </button>
        <button
          type="button"
          className={`rounded-xl border px-4 py-4 text-left ${method === "upload" ? "border-ink bg-ink text-white" : "border-border"}`}
          onClick={() => setMethod("upload")}
        >
          Upload verification letter
        </button>
        {method === "external" ? (
          <div>
            <label className="text-xs uppercase tracking-widest text-slate">Verification Code</label>
            <input
              className="mt-2 w-full rounded-lg border border-border px-4 py-3"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
          </div>
        ) : (
          <div>
            <label className="text-xs uppercase tracking-widest text-slate">Upload Letter</label>
            <input className="mt-2 w-full" type="file" onChange={(e) => setFile(e.target.files[0])} />
          </div>
        )}
        <button
          className="rounded-full bg-ink px-6 py-3 text-xs uppercase tracking-widest text-white"
          onClick={() => {
            const form = new FormData();
            form.append("method", method);
            form.append("verification_code", verificationCode);
            if (file) form.append("file", file);
            onSubmit(form);
          }}
        >
          Save & Continue
        </button>
      </div>
    </div>
  );
};

const StatusStep = ({ status }) => (
  <div>
    <h2 className="text-2xl font-semibold">Review Status</h2>
    <div className="mt-4 rounded-xl border border-border p-4 text-sm">
      <p><strong>Status:</strong> {status?.status}</p>
      {status?.status === "rejected" && status?.rejection_reason ? (
        <p className="mt-2 text-red-600">Reason: {status.rejection_reason}</p>
      ) : null}
    </div>
  </div>
);

const FundingStep = ({
  data,
  investments,
  payments,
  externalPurchases,
  portfolioAllocations,
  offerings,
  onCreateInvestment,
  onCreateExternalPurchase,
  onUpload,
  onUploadExternalProof
}) => {
  const pending = investments.filter((inv) => inv.status !== "active");
  const [investmentId, setInvestmentId] = useState(pending[0]?.id || "");
  const [amount, setAmount] = useState("");
  const [file, setFile] = useState(null);
  const [selectedOffering, setSelectedOffering] = useState(offerings[0]?.id || "");
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [investmentError, setInvestmentError] = useState("");
  const [purchaseOffering, setPurchaseOffering] = useState(offerings[0]?.id || "");
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [purchaseUnits, setPurchaseUnits] = useState("");
  const [purchaseId, setPurchaseId] = useState(externalPurchases[0]?.id || "");
  const [purchaseFile, setPurchaseFile] = useState(null);

  const latestPayment = payments
    ?.filter((payment) => String(payment.investment_id) === String(investmentId))
    ?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
  const hasPendingPayment = payments?.some((payment) => payment.status === "pending");
  const latestPurchase = externalPurchases
    ?.filter((purchase) => String(purchase.id) === String(purchaseId))
    ?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
  const hasActiveAllocation = portfolioAllocations?.some((item) => item.status === "active");
  const isExternal = data?.mode === "EXTERNAL";

  useEffect(() => {
    if (!investmentId && pending[0]?.id) {
      setInvestmentId(pending[0].id);
    }
  }, [pending, investmentId]);

  useEffect(() => {
    if (!selectedOffering && offerings[0]?.id) {
      setSelectedOffering(offerings[0].id);
    }
  }, [offerings, selectedOffering]);

  useEffect(() => {
    if (!purchaseOffering && offerings[0]?.id) {
      setPurchaseOffering(offerings[0].id);
    }
  }, [offerings, purchaseOffering]);

  useEffect(() => {
    if (!purchaseId && externalPurchases[0]?.id) {
      setPurchaseId(externalPurchases[0].id);
    }
  }, [externalPurchases, purchaseId]);

  return (
    <div>
      <h2 className="text-2xl font-semibold">Funding Instructions</h2>
      {data ? (
        <div className="mt-4 rounded-xl border border-border p-4 text-sm">
          {isExternal ? (
            <>
              <p className="text-sm">{data.instructions}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  className="rounded-full bg-ink px-6 py-3 text-xs uppercase tracking-widest text-white"
                  onClick={() => data.redirect_url && window.open(data.redirect_url, "_blank", "noopener")}
                >
                  Continue on {data.provider || "Wefunder"}
                </button>
              </div>
              {hasActiveAllocation ? (
                <p className="mt-3 text-xs text-emerald-700">
                  Your crowdfunder allocation is active. You can now access the crowdfunder portal.
                </p>
              ) : null}
            </>
          ) : (
            <>
              <p><strong>Bank:</strong> {data.bank_name}</p>
              <p><strong>Account Name:</strong> {data.account_name}</p>
              <p><strong>Routing:</strong> {data.routing_number}</p>
              <p><strong>Account:</strong> {data.account_number}</p>
              <p><strong>Reference:</strong> {data.reference}</p>
              <button
                className="mt-4 rounded-full border border-ink px-4 py-2 text-xs uppercase tracking-widest"
                onClick={() => navigator.clipboard?.writeText(data.reference || "")}
              >
                Copy Reference
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="mt-4 text-sm text-slate">Not available yet.</div>
      )}

      {isExternal ? (
        <div className="mt-6 grid gap-6">
          <div className="rounded-xl border border-border p-4">
            <h3 className="text-sm font-semibold">Start External Purchase</h3>
            {offerings.length ? (
              <div className="mt-4 grid gap-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-slate">Offering</label>
                  <select
                    className="mt-2 w-full rounded-lg border border-border px-4 py-3"
                    value={purchaseOffering}
                    onChange={(e) => setPurchaseOffering(e.target.value)}
                  >
                    {offerings.map((offering) => (
                      <option key={offering.id} value={offering.id}>
                        {offering.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-slate">Expected Amount (optional)</label>
                  <input
                    className="mt-2 w-full rounded-lg border border-border px-4 py-3"
                    value={purchaseAmount}
                    onChange={(e) => setPurchaseAmount(e.target.value)}
                    placeholder="Amount"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-slate">Expected Units (optional)</label>
                  <input
                    className="mt-2 w-full rounded-lg border border-border px-4 py-3"
                    value={purchaseUnits}
                    onChange={(e) => setPurchaseUnits(e.target.value)}
                    placeholder="Units"
                  />
                </div>
                <button
                  className="rounded-full bg-ink px-6 py-3 text-xs uppercase tracking-widest text-white"
                  onClick={() => {
                    const payload = {
                      offering_id: purchaseOffering,
                    };
                    if (purchaseAmount) payload.amount_expected = Number(purchaseAmount);
                    if (purchaseUnits) payload.units_expected = Number(purchaseUnits);
                    onCreateExternalPurchase(payload);
                  }}
                >
                  Start Purchase
                </button>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate">No offerings available yet.</p>
            )}
          </div>

          <div className="rounded-xl border border-border p-4">
            <h3 className="text-sm font-semibold">Upload Shares Confirmation</h3>
            {externalPurchases.length ? (
              <div className="mt-4 grid gap-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-slate">Purchase</label>
                  <select
                    className="mt-2 w-full rounded-lg border border-border px-4 py-3"
                    value={purchaseId}
                    onChange={(e) => setPurchaseId(e.target.value)}
                  >
                    {externalPurchases.map((purchase) => (
                      <option key={purchase.id} value={purchase.id}>
                        {purchase.reference} — {purchase.offering?.title || "Offering"} ({purchase.status})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-slate">Upload File</label>
                  <input className="mt-2 w-full" type="file" onChange={(e) => setPurchaseFile(e.target.files[0])} />
                </div>
                <button
                  className="rounded-full bg-ink px-6 py-3 text-xs uppercase tracking-widest text-white disabled:opacity-60"
                  disabled={latestPurchase?.status === "pending_review" || latestPurchase?.status === "approved"}
                  onClick={() => {
                    const form = new FormData();
                    if (purchaseFile) form.append("file", purchaseFile);
                    onUploadExternalProof(purchaseId, form);
                  }}
                >
                  {latestPurchase?.status === "approved"
                    ? "Approved"
                    : latestPurchase?.status === "pending_review"
                    ? "Waiting for Approval"
                    : "Submit Confirmation"}
                </button>
                {latestPurchase ? (
                  <p className="text-xs text-slate">
                    Latest status: <strong>{latestPurchase.status}</strong>
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate">No purchases yet.</p>
            )}
          </div>
        </div>
      ) : !hasPendingPayment ? (
        <div className="mt-6 rounded-xl border border-border p-4">
          <h3 className="text-sm font-semibold">Choose a Fund</h3>
          {offerings.length ? (
            <div className="mt-4 grid gap-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-slate">Fund</label>
                <select
                  className="mt-2 w-full rounded-lg border border-border px-4 py-3"
                  value={selectedOffering}
                  onChange={(e) => setSelectedOffering(e.target.value)}
                >
                  {offerings.map((offering) => (
                    <option key={offering.id} value={offering.id}>
                      {offering.title} (Min ${Number(offering.min_investment || 0).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-slate">Amount</label>
                <input
                  className="mt-2 w-full rounded-lg border border-border px-4 py-3"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  placeholder="Amount"
                />
                {investmentError ? <p className="mt-2 text-xs text-red-600">{investmentError}</p> : null}
              </div>
              <button
                className="rounded-full bg-ink px-6 py-3 text-xs uppercase tracking-widest text-white"
                onClick={() => {
                  const offering = offerings.find((item) => String(item.id) === String(selectedOffering));
                  const value = Number(investmentAmount);
                  if (!Number.isFinite(value) || value <= 0) {
                    setInvestmentError("Enter a valid amount.");
                    return;
                  }
                  if (offering?.min_investment && value < Number(offering.min_investment)) {
                    setInvestmentError(`Minimum investment is $${Number(offering.min_investment).toLocaleString()}.`);
                    return;
                  }
                  if (offering?.max_investment && value > Number(offering.max_investment)) {
                    setInvestmentError(`Maximum investment is $${Number(offering.max_investment).toLocaleString()}.`);
                    return;
                  }
                  setInvestmentError("");
                  onCreateInvestment({ offering_id: selectedOffering, amount: value });
                }}
              >
                Create Investment
              </button>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate">No funds available yet.</p>
          )}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-border p-4 text-sm text-slate">
          You already have a payment pending approval. Create a new investment after the current one is approved or rejected.
        </div>
      )}

      <div className="mt-6 rounded-xl border border-border p-4">
        <h3 className="text-sm font-semibold">Upload Proof of Payment</h3>
        {pending.length ? (
          <div className="mt-4 grid gap-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-slate">Investment</label>
              <select
                className="mt-2 w-full rounded-lg border border-border px-4 py-3"
                value={investmentId}
                onChange={(e) => setInvestmentId(e.target.value)}
              >
                {pending.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    #{inv.id} — {inv.offering?.title || "Offering"} (${Number(inv.amount || 0).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-slate">Amount Sent</label>
              <input
                className="mt-2 w-full rounded-lg border border-border px-4 py-3"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-slate">Upload Proof</label>
              <input className="mt-2 w-full" type="file" onChange={(e) => setFile(e.target.files[0])} />
            </div>
            <button
              className="rounded-full bg-ink px-6 py-3 text-xs uppercase tracking-widest text-white disabled:opacity-60"
              disabled={latestPayment?.status === "pending" || latestPayment?.status === "approved"}
              onClick={() => {
                const form = new FormData();
                form.append("investment_id", investmentId);
                form.append("amount", amount || pending.find((inv) => String(inv.id) === String(investmentId))?.amount || "");
                if (file) form.append("file", file);
                onUpload(form);
              }}
            >
              {latestPayment?.status === "approved"
                ? "Approved"
                : latestPayment?.status === "pending"
                ? "Waiting for Approval"
                : "Submit Proof"}
            </button>
            {latestPayment ? (
              <p className="text-xs text-slate">
                Latest proof status: <strong>{latestPayment.status}</strong>
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate">Create an investment first.</p>
        )}
      </div>
    </div>
  );
};

const DashboardStep = ({ state, dashboard }) => (
  <div>
    <h2 className="text-2xl font-semibold">Dashboard</h2>
    <div className="mt-4 grid gap-4 md:grid-cols-3">
      <div className="rounded-xl border border-border p-4">
        <p className="text-xs uppercase tracking-widest text-slate">Pathway</p>
        <p className="mt-2 text-lg font-semibold">{state?.pathway?.pathway || "-"}</p>
      </div>
      <div className="rounded-xl border border-border p-4">
        <p className="text-xs uppercase tracking-widest text-slate">Planned Amount</p>
        <p className="mt-2 text-lg font-semibold">{state?.experience?.planned_amount || "-"}</p>
      </div>
      <div className="rounded-xl border border-border p-4">
        <p className="text-xs uppercase tracking-widest text-slate">Documents</p>
        <p className="mt-2 text-lg font-semibold">{state?.documents?.length || 0}</p>
      </div>
    </div>

    <div className="mt-6 rounded-xl border border-border p-4">
      <p className="text-xs uppercase tracking-widest text-slate">Profile Status</p>
      <p className="mt-2 text-lg font-semibold">{dashboard?.profile?.status || "-"}</p>
    </div>

    <div className="mt-6">
      <p className="text-xs uppercase tracking-widest text-slate">Investments</p>
      <div className="mt-3 grid gap-3">
        {dashboard?.investments?.length ? (
          dashboard.investments.map((inv) => (
            <div key={inv.id} className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{inv.offering?.title || "Offering"}</p>
                  <p className="text-xs text-slate">Status: {inv.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">${Number(inv.amount || 0).toLocaleString()}</p>
                  <p className="text-xs text-slate">Committed</p>
                </div>
              </div>
              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate">Current Value</p>
                  <p className="mt-1 font-semibold">
                    {inv.current_value ? `$${Number(inv.current_value).toLocaleString()}` : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate">ROI</p>
                  <p className="mt-1 font-semibold">{inv.roi_percent != null ? `${inv.roi_percent}%` : "-"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate">As Of</p>
                  <p className="mt-1 font-semibold">{inv.as_of_date || "-"}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-slate">No investments yet.</div>
        )}
      </div>
    </div>
  </div>
);

export default OnboardingWizardFlow;

