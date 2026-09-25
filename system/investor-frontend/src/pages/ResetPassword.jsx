import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { api } from "../lib/api";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const emailFromLink = searchParams.get("email") || "";

  const [form, setForm] = useState({
    email: emailFromLink,
    password: "",
    password_confirmation: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (form.password !== form.password_confirmation) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      const data = await api.resetPassword({ token, ...form });
      navigate("/login", {
        replace: true,
        state: {
          notice: data?.message || "Your password has been reset. You can now sign in."
        }
      });
    } catch (err) {
      const res = err?.response?.data;
      const firstFieldError =
        res?.errors && Object.values(res.errors).flat()[0];
      setError(
        firstFieldError || res?.message || "Could not reset your password. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout
        title="Reset password."
        subtitle="This reset link is missing or invalid."
        footer={
          <Link className="font-semibold text-ink underline underline-offset-4" to="/forgot-password">
            Request a new reset link
          </Link>
        }
      >
        <p className="text-center text-sm text-slate">
          The link you followed doesn't contain a reset token. Please request a
          new password reset email.
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset password."
      subtitle="Choose a new password for your investor account."
      footer={
        <Link className="font-semibold text-ink underline underline-offset-4" to="/login">
          Back to sign in
        </Link>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="reset-email"
            className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate"
          >
            Email
          </label>
          <input
            id="reset-email"
            className="mt-2 w-full rounded-lg border border-border bg-pearl/60 px-4 py-3 text-sm outline-none transition focus:border-ink focus:bg-white"
            type="email"
            placeholder="name@email.com"
            autoComplete="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
          />
        </div>
        <div>
          <label
            htmlFor="reset-password"
            className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate"
          >
            New password
          </label>
          <input
            id="reset-password"
            className="mt-2 w-full rounded-lg border border-border bg-pearl/60 px-4 py-3 text-sm outline-none transition focus:border-ink focus:bg-white"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            required
          />
          <p className="mt-1.5 text-xs text-slate">Minimum 8 characters.</p>
        </div>
        <div>
          <label
            htmlFor="reset-password-confirm"
            className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate"
          >
            Confirm new password
          </label>
          <input
            id="reset-password-confirm"
            className="mt-2 w-full rounded-lg border border-border bg-pearl/60 px-4 py-3 text-sm outline-none transition focus:border-ink focus:bg-white"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={form.password_confirmation}
            onChange={(e) => update("password_confirmation", e.target.value)}
            required
          />
        </div>
        {error ? <div className="text-sm text-red-600">{error}</div> : null}
        <button
          className="w-full rounded-lg bg-ink px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-graphite disabled:opacity-60"
          disabled={submitting}
        >
          {submitting ? "Resetting..." : "Reset password"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
