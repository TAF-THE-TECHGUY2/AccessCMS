import React, { useEffect, useMemo, useState } from "react";
import Shell from "../components/Shell";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

const stepsBase = [
  { key: "track", label: "Select Investor Path" },
  { key: "profile", label: "Profile Details" },
  { key: "documents", label: "Upload Documents" },
  { key: "review", label: "Review & Submit" },
  { key: "wait", label: "Wait for Review" },
  { key: "agreement", label: "Agreement" },
  { key: "investment", label: "Select Investment" },
  { key: "payment", label: "Payment" },
  { key: "dashboard", label: "Investor Dashboard" }
];

const OnboardingWizard = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [status, setStatus] = useState("");
  const [offerings, setOfferings] = useState([]);
  const [selectedOfferingId, setSelectedOfferingId] = useState("");
  const [createdInvestmentId, setCreatedInvestmentId] = useState("");
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [packageFiles, setPackageFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const isCrowdfunder = profile?.investor_track === "CROWDFUNDER";

  const steps = useMemo(() => {
    if (isCrowdfunder) {
      const clone = [...stepsBase];
      clone.splice(4, 0, { key: "partner", label: "Partner Account Setup" });
      return clone;
    }
    return stepsBase;
  }, [isCrowdfunder]);

  const refresh = async () => {
    setLoading(true);
    const data = await api.getStatus();
    setProfile(data.profile);
    setChecklist(data.checklist || []);
    setStatus(data.profile?.status || "");
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    api.getOfferings().then((data) => setOfferings(data.offerings || [])).catch(() => {});
  }, []);

  const requiredDocs = checklist.filter((item) => item.required && item.stage === "initial");
  const signedDocs = checklist.filter((item) => item.required && item.stage === "signed");
  const partnerDoc = checklist.find((item) => item.code === "partner_profile_screenshot");

  const uploadDoc = async (docTypeId, file) => {
    const form = new FormData();
    form.append("document_type_id", docTypeId);
    form.append("file", file);
    await api.uploadDocument(form);
    await refresh();
  };

  const renderStep = () => {
    if (!profile) {
      return <div className="text-sm text-slate">Loading profile...</div>;
    }

    switch (steps[currentStep]?.key) {
      case "track":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Select your investor path</h2>
            <p className="text-sm text-slate">Your track is set during registration.</p>
            <div className="rounded-xl border border-border p-6">
              <p className="text-sm uppercase tracking-widest text-slate">Current Track</p>
              <div className="mt-3 text-2xl font-semibold">{profile.investor_track}</div>
            </div>
          </div>
        );
      case "profile":
        return (
          <ProfileForm profile={profile} onSave={async (payload) => {
            await api.updateProfile(payload);
            await refresh();
          }} />
        );
      case "documents":
        return (
          <DocumentUpload
            requiredDocs={requiredDocs}
            checklist={checklist}
            onUpload={uploadDoc}
          />
        );
      case "review":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Review & Submit</h2>
            <p className="text-sm text-slate">Confirm your details and submit for review.</p>
            <div className="rounded-xl border border-border p-4 text-sm">
              <p><strong>Name:</strong> {profile.full_name}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Track:</strong> {profile.investor_track}</p>
            </div>
            <button
              className="rounded-lg bg-ink px-6 py-3 text-xs uppercase tracking-widest text-white"
              onClick={async () => {
                await api.submitApplication();
                await refresh();
                setMessage("Application submitted.");
              }}
            >
              Submit Application
            </button>
          </div>
        );
      case "partner":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Partner Account Setup</h2>
            <p className="text-sm text-slate">
              Create your partner platform account and upload a screenshot of your profile page.
            </p>
            <div className="rounded-xl border border-border p-4">
              <label className="text-xs uppercase tracking-widest text-slate">Partner Profile URL (optional)</label>
              <input
                className="mt-2 w-full rounded-lg border border-border px-4 py-3"
                value={profile.partner_profile_url || ""}
                onChange={(e) => setProfile({ ...profile, partner_profile_url: e.target.value })}
              />
              <button
                className="mt-3 rounded-lg border border-ink px-4 py-2 text-xs uppercase tracking-widest"
                onClick={async () => {
                  await api.updateProfile({ partner_profile_url: profile.partner_profile_url });
                  await refresh();
                }}
              >
                Save URL
              </button>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-sm">Upload Partner Screenshot</p>
              {partnerDoc ? (
                <input
                  type="file"
                  className="mt-2"
                  onChange={(e) => uploadDoc(partnerDoc.document_type_id, e.target.files[0])}
                />
              ) : (
                <p className="text-sm text-slate">Partner screenshot document type not configured.</p>
              )}
            </div>
          </div>
        );
      case "wait":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Review Status</h2>
            <p className="text-sm text-slate">We will notify you once your documents are reviewed.</p>
            <StatusChecklist checklist={checklist} status={status} />
          </div>
        );
      case "agreement":
        return (
          <AgreementStep
            signedDocs={signedDocs}
            packageFiles={packageFiles}
            onAccept={async () => {
              await api.acceptAgreement();
              await refresh();
            }}
            onFetchPackage={async () => {
              const data = await api.getAgreementPackage();
              setPackageFiles(data.files || []);
            }}
            onUpload={uploadDoc}
          />
        );
      case "investment":
        return (
          <InvestmentStep
            offerings={offerings}
            selectedOfferingId={selectedOfferingId}
            investmentAmount={investmentAmount}
            setSelectedOfferingId={setSelectedOfferingId}
            setInvestmentAmount={setInvestmentAmount}
            onSubmit={async () => {
              const data = await api.createInvestment({ offering_id: selectedOfferingId, amount: investmentAmount });
              setCreatedInvestmentId(data.investment.id);
              setMessage("Investment created.");
            }}
          />
        );
      case "payment":
        return (
          <PaymentStep
            investmentId={createdInvestmentId}
            paymentAmount={paymentAmount}
            setPaymentAmount={setPaymentAmount}
            onUpload={async (file) => {
              const form = new FormData();
              form.append("investment_id", createdInvestmentId);
              form.append("amount", paymentAmount || investmentAmount);
              form.append("file", file);
              await api.uploadPaymentProof(form);
              setMessage("Payment proof uploaded.");
            }}
          />
        );
      case "dashboard":
        return (
          <DashboardStep profile={profile} checklist={checklist} />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Shell>
        <div className="text-sm text-slate">Loading onboarding...</div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-2xl border border-border bg-pearl p-6">
          <h3 className="text-xs uppercase tracking-[0.3em] text-slate">Onboarding</h3>
          <nav className="mt-6 space-y-3 text-sm">
            {steps.map((step, index) => (
              <button
                key={step.key}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left ${
                  index === currentStep ? "bg-ink text-white" : "text-ink"
                }`}
                onClick={() => setCurrentStep(index)}
              >
                <span>{step.label}</span>
                <span className="text-xs opacity-60">{index + 1}</span>
              </button>
            ))}
          </nav>
        </aside>

        <section className="rounded-2xl border border-border bg-white p-8 shadow-card">
          {message ? <div className="mb-4 rounded-lg border border-border bg-pearl px-4 py-2 text-sm">{message}</div> : null}
          {renderStep()}
          <div className="mt-8 flex items-center justify-between">
            <button
              className="rounded-full border border-ink px-4 py-2 text-xs uppercase tracking-widest"
              disabled={currentStep === 0}
              onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
            >
              Back
            </button>
            <button
              className="rounded-full bg-ink px-4 py-2 text-xs uppercase tracking-widest text-white"
              disabled={currentStep === steps.length - 1}
              onClick={() => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))}
            >
              Next
            </button>
          </div>
        </section>
      </div>
    </Shell>
  );
};

const ProfileForm = ({ profile, onSave }) => {
  const [form, setForm] = useState({
    full_name: profile.full_name || "",
    title: profile.title || "",
    phone: profile.phone || "",
    email: profile.email || "",
    address_line1: profile.address_line1 || "",
    address_line2: profile.address_line2 || "",
    city: profile.city || "",
    state: profile.state || "",
    postal_code: profile.postal_code || "",
    country: profile.country || "",
    capital_contribution_amount: profile.capital_contribution_amount || 0,
    units_purchased: profile.units_purchased || 0,
    equity_percent: profile.equity_percent || 0
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Profile Details</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(form).map(([key, value]) => (
          <div key={key} className="md:col-span-1">
            <label className="text-xs uppercase tracking-widest text-slate">{key.replace(/_/g, " ")}</label>
            <input
              className="mt-2 w-full rounded-lg border border-border px-4 py-3"
              value={value}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </div>
        ))}
      </div>
      <button
        className="rounded-lg bg-ink px-6 py-3 text-xs uppercase tracking-widest text-white"
        onClick={() => onSave(form)}
      >
        Save Profile
      </button>
    </div>
  );
};

const DocumentUpload = ({ requiredDocs, checklist, onUpload }) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold">Upload Documents</h2>
    <p className="text-sm text-slate">Only PDF, JPG, PNG allowed.</p>
    <div className="space-y-4">
      {requiredDocs.map((doc) => (
        <div key={doc.document_type_id} className="rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{doc.name}</p>
              <p className="text-xs text-slate">Status: {doc.status}</p>
            </div>
            <input type="file" onChange={(e) => onUpload(doc.document_type_id, e.target.files[0])} />
          </div>
        </div>
      ))}
      {!requiredDocs.length && <p className="text-sm text-slate">No documents required.</p>}
    </div>
  </div>
);

const StatusChecklist = ({ checklist, status }) => (
  <div className="rounded-xl border border-border p-4">
    <p className="text-sm"><strong>Status:</strong> {status}</p>
    <ul className="mt-3 space-y-2 text-sm">
      {checklist.map((item) => (
        <li key={item.document_type_id} className="flex items-center justify-between">
          <span>{item.name}</span>
          <span className="text-slate">{item.status}</span>
        </li>
      ))}
    </ul>
  </div>
);

const AgreementStep = ({ signedDocs, onAccept, onUpload, onFetchPackage, packageFiles }) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold">Agreement Packet</h2>
    <p className="text-sm text-slate">Download the agreement packet, sign, and upload your signed documents.</p>
    <div className="flex flex-wrap gap-3">
      <button
        className="rounded-lg border border-ink px-4 py-2 text-xs uppercase tracking-widest"
        onClick={onFetchPackage}
      >
        Get Agreement Package
      </button>
      <button
        className="rounded-lg bg-ink px-4 py-2 text-xs uppercase tracking-widest text-white"
        onClick={onAccept}
      >
        I Agree & Continue
      </button>
    </div>
    {packageFiles.length ? (
      <ul className="text-sm text-slate">
        {packageFiles.map((file) => (
          <li key={file.key}>
            <a className="underline" href={file.url} target="_blank" rel="noreferrer">
              {file.key}
            </a>
          </li>
        ))}
      </ul>
    ) : null}
    <div className="space-y-3">
      {signedDocs.map((doc) => (
        <div key={doc.document_type_id} className="rounded-xl border border-border p-4">
          <p className="font-semibold">{doc.name}</p>
          <p className="text-xs text-slate">Status: {doc.status}</p>
          <input
            type="file"
            className="mt-2"
            onChange={(e) => onUpload(doc.document_type_id, e.target.files[0])}
          />
        </div>
      ))}
    </div>
  </div>
);

const InvestmentStep = ({ offerings, selectedOfferingId, investmentAmount, setSelectedOfferingId, setInvestmentAmount, onSubmit }) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold">Select Investment</h2>
    <div className="grid gap-4">
      <select
        className="rounded-lg border border-border px-4 py-3"
        value={selectedOfferingId}
        onChange={(e) => setSelectedOfferingId(e.target.value)}
      >
        <option value="">Select offering</option>
        {offerings.map((offering) => (
          <option key={offering.id} value={offering.id}>
            {offering.title}
          </option>
        ))}
      </select>
      <input
        className="rounded-lg border border-border px-4 py-3"
        placeholder="Amount"
        value={investmentAmount}
        onChange={(e) => setInvestmentAmount(e.target.value)}
      />
      <button className="rounded-lg bg-ink px-4 py-3 text-xs uppercase tracking-widest text-white" onClick={onSubmit}>
        Create Investment
      </button>
    </div>
  </div>
);

const PaymentStep = ({ investmentId, paymentAmount, setPaymentAmount, onUpload }) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold">Payment</h2>
    <p className="text-sm text-slate">Upload proof of payment for your investment.</p>
    <input
      className="rounded-lg border border-border px-4 py-3"
      placeholder="Payment amount"
      value={paymentAmount}
      onChange={(e) => setPaymentAmount(e.target.value)}
    />
    <input type="file" onChange={(e) => onUpload(e.target.files[0])} />
    {!investmentId ? <p className="text-sm text-red-600">Create an investment first.</p> : null}
  </div>
);

const DashboardStep = ({ profile, checklist }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold">Investor Dashboard</h2>
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-xl border border-border p-4">
        <p className="text-xs uppercase tracking-widest text-slate">Status</p>
        <p className="mt-2 text-lg font-semibold">{profile.status}</p>
      </div>
      <div className="rounded-xl border border-border p-4">
        <p className="text-xs uppercase tracking-widest text-slate">Track</p>
        <p className="mt-2 text-lg font-semibold">{profile.investor_track}</p>
      </div>
      <div className="rounded-xl border border-border p-4">
        <p className="text-xs uppercase tracking-widest text-slate">Partner Status</p>
        <p className="mt-2 text-lg font-semibold">{profile.partner_status}</p>
      </div>
    </div>
    <div className="rounded-xl border border-border p-4">
      <p className="text-sm font-semibold">Document Vault</p>
      <ul className="mt-3 space-y-2 text-sm">
        {checklist.map((doc) => (
          <li key={doc.document_type_id} className="flex items-center justify-between">
            <span>{doc.name}</span>
            <span className="text-slate">{doc.status}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default OnboardingWizard;
