import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Shell from "../components/Shell";
import { useAuth } from "../lib/auth";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await login(form);
      navigate("/onboarding");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed.");
    }
  };

  return (
    <Shell>
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-pearl p-8 shadow-card">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="mt-2 text-sm text-slate">Log in to continue your onboarding.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs uppercase tracking-widest text-slate">Email</label>
            <input
              className="mt-2 w-full rounded-lg border border-border px-4 py-3"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-slate">Password</label>
            <input
              className="mt-2 w-full rounded-lg border border-border px-4 py-3"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          {error ? <div className="text-sm text-red-600">{error}</div> : null}
          <button className="w-full rounded-lg bg-ink px-4 py-3 text-sm uppercase tracking-widest text-white">
            Login
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate">
          No account yet?{" "}
          <Link className="font-semibold text-ink" to="/register">
            Create one
          </Link>
        </p>
      </div>
    </Shell>
  );
};

export default Login;
