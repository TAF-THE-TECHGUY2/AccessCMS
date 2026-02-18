import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

export default function AuthPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const mode = state?.mode || "register";
  const { login, register } = useAuth();
  const amount = state?.amount || 100;
  const track = state?.track || "CROWDFUNDER";
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
  });
  const [error, setError] = useState("");

  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (mode === "login") {
        await login({ email: form.email, password: form.password });
      } else {
        await register({
          ...form,
          capital_contribution_amount: amount,
          investor_track: track,
        });
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  };

  useEffect(() => {
    if (!sessionStorage.getItem("invest_gate")) {
      navigate("/invest-now", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-night text-white flex items-center justify-center px-4 py-10">
      <div className="max-w-xl w-full bg-white/5 border border-white/10 rounded-3xl p-8">
        <h1 className="text-3xl font-semibold">{mode === "login" ? "Welcome back" : "Create account"}</h1>
        <p className="text-sm text-white/60 mt-2">
          {mode === "login" ? "Sign in to continue your onboarding." : "Complete your investor profile to continue."}
        </p>
        {mode === "register" ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            <div>Track: <span className="text-white">{track}</span></div>
            <div>Investment amount: <span className="text-white">${Number(amount).toLocaleString()}</span></div>
          </div>
        ) : null}
        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
              {mode === "register" ? (
            <>
              <input className="input" name="full_name" placeholder="Full name" onChange={onChange} required />
              <input className="input" name="title" placeholder="Title (optional)" onChange={onChange} />
              <input className="input" name="phone" placeholder="Phone" onChange={onChange} required />
              <input className="input" name="address_line1" placeholder="Address line 1" onChange={onChange} required />
              <input className="input" name="address_line2" placeholder="Address line 2" onChange={onChange} />
              <div className="grid md:grid-cols-2 gap-3">
                <input className="input" name="city" placeholder="City" onChange={onChange} required />
                <input className="input" name="state" placeholder="State" onChange={onChange} required />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <input className="input" name="postal_code" placeholder="Postal code" onChange={onChange} required />
                <input className="input" name="country" placeholder="Country" onChange={onChange} value={form.country} />
              </div>
            </>
          ) : null}
          <input className="input" type="email" name="email" placeholder="Email" onChange={onChange} required />
          <input className="input" type="password" name="password" placeholder="Password" onChange={onChange} required />
          {mode === "register" ? (
            <input
              className="input"
              type="password"
              name="password_confirmation"
              placeholder="Confirm password"
              onChange={onChange}
              required
            />
          ) : null}
          {error ? <div className="text-red-400 text-sm">{error}</div> : null}
          <button className="bg-white text-black px-6 py-3 rounded-xl font-semibold">
            {mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
