import React, { useEffect, useState } from "react";
import Shell from "../../components/Shell";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";

const ReviewStatus = () => {
  const [overview, setOverview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const load = async () => {
      const data = await api.onboardingOverview();
      if (!active) return;
      setOverview(data);
      if (data.review_status === "approved" && data.kyc?.approved) {
        navigate("/onboarding/funding");
      }
    };
    load();
    const interval = setInterval(load, 10000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const reviewStatus = overview?.review_status || "draft";
  const reviewReason = overview?.review_rejection_reason || "";
  const tasks = overview?.tasks || [];
  const artifactTasks = tasks.filter((task) =>
    ["identity_documents", "partner_proof", "accreditation"].includes(task.key)
  );

  return (
    <Shell>
      <div className="mx-auto max-w-xl space-y-4">
        <h2 className="text-2xl font-semibold">Review Status</h2>
        <p className="text-sm text-slate">Track each compliance item and resolve any blocked or rejected steps.</p>
        <div className="rounded-xl border border-border p-4">
          <p className="text-sm"><strong>Package status:</strong> {reviewStatus}</p>
          {reviewStatus === "rejected" && reviewReason ? (
            <p className="mt-2 text-sm text-red-600">Reason: {reviewReason}</p>
          ) : null}
        </div>
        <div className="space-y-3">
          {artifactTasks.map((task) => (
            <div key={task.key} className="rounded-xl border border-border p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{task.title}</p>
                  <p className="mt-1 text-sm text-slate">{task.description}</p>
                  {task.rejection_reason ? (
                    <p className="mt-2 text-sm text-red-600">Reason: {task.rejection_reason}</p>
                  ) : null}
                </div>
                <span className="text-sm font-medium">{task.status}</span>
              </div>
              {(task.status === "open" || task.status === "rejected" || task.status === "missing") && (
                <button
                  className="mt-4 rounded-full bg-ink px-4 py-2 text-xs uppercase tracking-widest text-white"
                  onClick={() => navigate(task.href)}
                >
                  Resolve
                </button>
              )}
            </div>
          ))}
        </div>
        {overview?.blocking_reasons?.length ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">Current blockers</p>
            <ul className="mt-2 list-disc pl-5">
              {overview.blocking_reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </Shell>
  );
};

export default ReviewStatus;
