import React, { useEffect, useState } from "react";
import Shell from "../../components/Shell";
import { useOnboarding } from "../../lib/onboarding";
import { api } from "../../lib/api";

const Dashboard = () => {
  const { state } = useOnboarding();
  const [dashboard, setDashboard] = useState({ profile: null, investments: [] });

  useEffect(() => {
    api.investorDashboard().then(setDashboard).catch(() => {});
    const interval = setInterval(() => {
      api.investorDashboard().then(setDashboard).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Shell>
      <div className="mx-auto max-w-3xl space-y-6">
        <h2 className="text-2xl font-semibold">Investor Dashboard</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border p-4">
            <p className="text-xs uppercase tracking-widest text-slate">Pathway</p>
            <p className="mt-2 text-lg font-semibold">{state?.pathway?.pathway || "-"}</p>
          </div>
          <div className="rounded-xl border border-border p-4">
            <p className="text-xs uppercase tracking-widest text-slate">Planned Amount</p>
            <p className="mt-2 text-lg font-semibold">{state?.experience?.planned_amount || "-"}</p>
          </div>
          <div className="rounded-xl border border-border p-4">
            <p className="text-xs uppercase tracking-widest text-slate">Documents</p>
            <p className="mt-2 text-lg font-semibold">{state?.documents?.length || 0}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border p-4">
          <p className="text-xs uppercase tracking-widest text-slate">Profile Status</p>
          <p className="mt-2 text-lg font-semibold">{dashboard?.profile?.status || "-"}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-slate">Investments</p>
          <div className="mt-3 grid gap-3">
            {dashboard?.investments?.length ? (
              dashboard.investments.map((inv) => (
                <div key={inv.id} className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{inv.offering?.title || "Offering"}</p>
                      <p className="text-xs text-slate">Status: {inv.status}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">${Number(inv.amount || 0).toLocaleString()}</p>
                      <p className="text-xs text-slate">Committed</p>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate">Current Value</p>
                      <p className="mt-1 font-semibold">
                        {inv.current_value ? `$${Number(inv.current_value).toLocaleString()}` : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate">ROI</p>
                      <p className="mt-1 font-semibold">{inv.roi_percent != null ? `${inv.roi_percent}%` : "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate">As Of</p>
                      <p className="mt-1 font-semibold">{inv.as_of_date || "-"}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-slate">No investments yet.</div>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
};

export default Dashboard;
