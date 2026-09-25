import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { api } from "../lib/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      const data = await api.forgotPassword({ email });
      setMessage(
        data?.message ||
          "If an account exists for that email, a password reset link has been sent."
      );
    } catch (err) {
      setError(
        err?.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="Enter the email you signed up with and we'll send you a link to reset your password."
      footer={
        <>
          Remembered it?{" "}
          <Link className="font-semibold text-ink underline underline-offset-4" to="/login">
            Back to sign in
          </Link>
        </>
      }
    >
      {message ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="forgot-email"
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate"
            >
              Email
            </label>
            <input
              id="forgot-email"
              className="mt-2 w-full rounded-lg border border-border bg-pearl/60 px-4 py-3 text-sm outline-none transition focus:border-ink focus:bg-white"
              type="email"
              placeholder="name@email.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {error ? <div className="text-sm text-red-600">{error}</div> : null}
          <button
            className="w-full rounded-lg bg-ink px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-graphite disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
