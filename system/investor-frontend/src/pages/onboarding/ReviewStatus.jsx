import React, { useEffect, useState } from "react";
import Shell from "../../components/Shell";
import { useOnboarding } from "../../lib/onboarding";
import { useNavigate } from "react-router-dom";

const ReviewStatus = () => {
  const { fetchStatus } = useOnboarding();
  const [status, setStatus] = useState("pending");
  const [reason, setReason] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const load = async () => {
      const data = await fetchStatus();
      if (!active) return;
      setStatus(data.status);
      setReason(data.rejection_reason);
      if (data.status === "approved") {
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

  return (
    <Shell>
      <div className="mx-auto max-w-xl space-y-4">
        <h2 className="text-2xl font-semibold">Review Status</h2>
        <p className="text-sm text-slate">We are reviewing your submission.</p>
        <div className="rounded-xl border border-border p-4">
          <p className="text-sm"><strong>Status:</strong> {status}</p>
          {status === "rejected" && reason ? (
            <p className="mt-2 text-sm text-red-600">Reason: {reason}</p>
          ) : null}
        </div>
      </div>
    </Shell>
  );
};

export default ReviewStatus;
