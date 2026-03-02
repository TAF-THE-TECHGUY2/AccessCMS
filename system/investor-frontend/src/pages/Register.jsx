import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Shell from "../components/Shell";
import { useAuth } from "../lib/auth";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    title: "",
    phone: "",
    email: "",
    password: "",
    password_confirmation: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "USA",
    equity_percent: 0,
    investor_track: "CROWDFUNDER"
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/welcome");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed.");
    }
  };

  const update = (field, value) => setForm({ ...form, [field]: value });

  return (
    <Shell>
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-pearl p-8 shadow-card">
        <h1 className="text-2xl font-semibold">Create your investor profile</h1>
        <p className="mt-2 text-sm text-slate">Start the onboarding process in minutes.</p>
        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="md:col-span-2">
            <label className="text-xs uppercase tracking-widest text-slate">Investor Track</label>
            <select
              className="mt-2 w-full rounded-lg border border-border px-4 py-3"
              value={form.investor_track}
              onChange={(e) => update("investor_track", e.target.value)}
            >
              <option value="CROWDFUNDER">Crowdfunder</option>
              <option value="ACCREDITED">Accredited</option>
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-slate">Full Name</label>
            <input className="mt-2 w-full rounded-lg border border-border px-4 py-3" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} required />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-slate">Title</label>
            <input className="mt-2 w-full rounded-lg border border-border px-4 py-3" value={form.title} onChange={(e) => update("title", e.target.value)} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-slate">Phone</label>
            <input className="mt-2 w-full rounded-lg border border-border px-4 py-3" value={form.phone} onChange={(e) => update("phone", e.target.value)} required />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-slate">Email</label>
            <input type="email" className="mt-2 w-full rounded-lg border border-border px-4 py-3" value={form.email} onChange={(e) => update("email", e.target.value)} required />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-slate">Password</label>
            <input type="password" className="mt-2 w-full rounded-lg border border-border px-4 py-3" value={form.password} onChange={(e) => update("password", e.target.value)} required />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-slate">Confirm Password</label>
            <input type="password" className="mt-2 w-full rounded-lg border border-border px-4 py-3" value={form.password_confirmation} onChange={(e) => update("password_confirmation", e.target.value)} required />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs uppercase tracking-widest text-slate">Address Line 1</label>
            <input className="mt-2 w-full rounded-lg border border-border px-4 py-3" value={form.address_line1} onChange={(e) => update("address_line1", e.target.value)} required />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs uppercase tracking-widest text-slate">Address Line 2</label>
            <input className="mt-2 w-full rounded-lg border border-border px-4 py-3" value={form.address_line2} onChange={(e) => update("address_line2", e.target.value)} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-slate">City</label>
            <input className="mt-2 w-full rounded-lg border border-border px-4 py-3" value={form.city} onChange={(e) => update("city", e.target.value)} required />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-slate">State</label>
            <input className="mt-2 w-full rounded-lg border border-border px-4 py-3" value={form.state} onChange={(e) => update("state", e.target.value)} required />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-slate">Postal Code</label>
            <input className="mt-2 w-full rounded-lg border border-border px-4 py-3" value={form.postal_code} onChange={(e) => update("postal_code", e.target.value)} required />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-slate">Country</label>
            <input className="mt-2 w-full rounded-lg border border-border px-4 py-3" value={form.country} onChange={(e) => update("country", e.target.value)} required />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs uppercase tracking-widest text-slate">Equity Percent</label>
            <input type="number" className="mt-2 w-full rounded-lg border border-border px-4 py-3" value={form.equity_percent} onChange={(e) => update("equity_percent", e.target.value)} />
          </div>
          {error ? <div className="md:col-span-2 text-sm text-red-600">{error}</div> : null}
          <button className="md:col-span-2 w-full rounded-lg bg-ink px-4 py-3 text-sm uppercase tracking-widest text-white">
            Create Account
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-slate">
          <p>
            Already have an account?{" "}
            <Link className="font-semibold text-ink" to="/login">
              Log in
            </Link>
          </p>
          <p className="mt-2">
            Prefer a guided experience?{" "}
            <Link className="font-semibold text-ink" to="/assistant-register">
              Try conversational signup
            </Link>
          </p>
        </div>
      </div>
    </Shell>
  );
};

export default Register;
