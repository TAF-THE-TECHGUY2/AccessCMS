import React, { useEffect, useState } from "react";
import Shell from "../../components/Shell";
import { useOnboarding } from "../../lib/onboarding";

const FundingInstructions = () => {
  const { fetchFunding, state } = useOnboarding();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (state?.pathway?.pathway && state.pathway.pathway !== "crowdfunding") {
      return;
    }
    fetchFunding()
      .then((res) => setData(res))
      .catch((err) => setError(err?.response?.data?.message || "Not available yet."));
  }, [state?.pathway?.pathway]);

  return (
    <Shell>
      <div className="mx-auto max-w-xl space-y-4">
        <h2 className="text-2xl font-semibold">Funding Instructions</h2>
        {state?.pathway?.pathway && state.pathway.pathway !== "crowdfunding" ? (
          <div className="rounded-xl border border-border p-4 text-sm text-slate">
            Funding instructions are only available for the crowdfunding pathway.
          </div>
        ) : (
          <>
            {error ? <div className="text-sm text-red-600">{error}</div> : null}
            {data ? (
              <div className="rounded-xl border border-border p-4 text-sm">
                <p><strong>Bank:</strong> {data.bank_name}</p>
                <p><strong>Account Name:</strong> {data.account_name}</p>
                <p><strong>Routing:</strong> {data.routing_number}</p>
                <p><strong>Account:</strong> {data.account_number}</p>
                <p><strong>Reference:</strong> {data.reference}</p>
              </div>
            ) : null}
          </>
        )}
      </div>
    </Shell>
  );
};

export default FundingInstructions;
