import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Shell from "../../components/Shell";
import { useOnboarding } from "../../lib/onboarding";

const BasicProfileForm = () => {
  const { saveBasic } = useOnboarding();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: ""
  });
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await saveBasic(form);
      navigate("/onboarding/experience");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save.");
    }
  };

  return (
    <Shell>
      <div className="mx-auto max-w-xl space-y-6">
        <h2 className="text-2xl font-semibold">Basic Information</h2>
        <form className="space-y-4" onSubmit={submit}>
          {["first_name", "last_name", "email", "phone"].map((field) => (
            <div key={field}>
              <label className="text-xs uppercase tracking-widest text-slate">{field.replace("_", " ")}</label>
              <input
                className="mt-2 w-full rounded-lg border border-border px-4 py-3"
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                required
              />
            </div>
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

export default BasicProfileForm;
