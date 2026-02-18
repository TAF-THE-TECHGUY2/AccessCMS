import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Shell from "../../components/Shell";
import { useOnboarding } from "../../lib/onboarding";

const AccreditedVerification = () => {
  const { saveAccreditation } = useOnboarding();
  const navigate = useNavigate();
  const [method, setMethod] = useState("external");
  const [verificationCode, setVerificationCode] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    const form = new FormData();
    form.append("method", method);
    form.append("verification_code", verificationCode);
    if (file) form.append("file", file);
    try {
      await saveAccreditation(form);
      navigate("/onboarding/status");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save.");
    }
  };

  return (
    <Shell>
      <div className="mx-auto max-w-xl space-y-6">
        <h2 className="text-2xl font-semibold">Accredited Verification</h2>
        <form className="space-y-4" onSubmit={submit}>
          <div className="grid gap-3">
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
          </div>
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
          {error ? <div className="text-sm text-red-600">{error}</div> : null}
          <button className="rounded-full bg-ink px-6 py-3 text-xs uppercase tracking-widest text-white">
            Continue
          </button>
        </form>
      </div>
    </Shell>
  );
};

export default AccreditedVerification;
