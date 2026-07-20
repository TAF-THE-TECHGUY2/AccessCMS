import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../lib/auth";

const EyeIcon = ({ open }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
    {open ? <line x1="4" y1="20" x2="20" y2="4" /> : null}
  </svg>
);

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const notice = location.state?.notice || "";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Sign in."
      subtitle="Continue your accredited investor onboarding or access your investment account."
      footer={
        <>
          New to the accredited investor pathway?{" "}
          <Link className="font-semibold text-ink underline underline-offset-4" to="/register">
            Create an account
          </Link>
        </>
      }
    >
      {notice ? (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </div>
      ) : null}
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="login-email"
            className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate"
          >
            Email
          </label>
          <input
            id="login-email"
            className="mt-2 w-full rounded-lg border border-border bg-pearl/60 px-4 py-3 text-sm outline-none transition focus:border-ink focus:bg-white"
            type="email"
            placeholder="name@email.com"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate"
            >
              Password
            </label>
            <Link
              className="text-sm font-semibold text-ink underline underline-offset-4"
              to="/forgot-password"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative mt-2">
            <input
              id="login-password"
              className="w-full rounded-lg border border-border bg-pearl/60 px-4 py-3 pr-12 text-sm outline-none transition focus:border-ink focus:bg-white"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center px-4 text-slate transition hover:text-ink"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>
        </div>
        {error ? <div className="text-sm text-red-600">{error}</div> : null}
        <button
          className="w-full rounded-lg bg-ink px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-graphite disabled:opacity-60"
          disabled={submitting}
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;
