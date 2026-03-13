import React, { useEffect, useState } from "react";
import Shell from "../components/Shell";
import { api } from "../lib/api";

const InvestorPanel = () => {
  const [data, setData] = useState({
    profile: null,
    investments: [],
    payments: [],
    portfolio_allocations: [],
    external_purchases: []
  });

  useEffect(() => {
    api.investorDashboard().then(setData).catch(() => {});
    const interval = setInterval(() => {
      api.investorDashboard().then(setData).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const directCommitted =
    data.investments?.reduce((sum, inv) => sum + Number(inv.amount || 0), 0) || 0;
  const directCurrentValue =
    data.investments?.reduce((sum, inv) => sum + Number(inv.current_value || inv.amount || 0), 0) || 0;
  const totalAllocated =
    data.portfolio_allocations?.reduce((sum, allocation) => sum + Number(allocation.amount || 0), 0) || 0;
  const totalCommitted = directCommitted + totalAllocated;
  const totalCurrentValue = directCurrentValue + totalAllocated;
  const activeFundingItems = (data.external_purchases || []).filter(
    (purchase) => !["approved"].includes(String(purchase.status || "").toLowerCase())
  );
  const hasDirectInvestments = (data.investments?.length || 0) > 0;
  const hasCrowdfunderHoldings = (data.portfolio_allocations?.length || 0) > 0;
  const hasPayments = (data.payments?.length || 0) > 0;
  const hasFundingActivity = activeFundingItems.length > 0 || hasPayments;

  return (
    <Shell>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-2xl border border-border bg-white p-6 shadow-card">
          <h2 className="text-2xl font-semibold">Investor Panel</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs uppercase tracking-widest text-slate">Status</p>
              <p className="mt-2 text-lg font-semibold">{data.profile?.status || "-"}</p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs uppercase tracking-widest text-slate">Total Committed</p>
              <p className="mt-2 text-lg font-semibold">${totalCommitted.toLocaleString()}</p>
              {totalAllocated > 0 ? (
                <p className="mt-1 text-xs text-slate">
                  Includes ${totalAllocated.toLocaleString()} in crowdfunder holdings
                </p>
              ) : null}
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs uppercase tracking-widest text-slate">Current Value</p>
              <p className="mt-2 text-lg font-semibold">${totalCurrentValue.toLocaleString()}</p>
              <p className="mt-1 text-xs text-slate">
                Using allocation amount until performance data is available
              </p>
            </div>
          </div>
        </div>

        {hasDirectInvestments ? (
          <div className="rounded-2xl border border-border bg-white p-6 shadow-card">
            <h3 className="text-lg font-semibold">Direct Investments</h3>
            <div className="mt-4 grid gap-3">
              {data.investments.map((inv) => (
                <div key={inv.id} className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{inv.offering?.title || "Offering"}</p>
                      <p className="text-xs text-slate">Status: {inv.status}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        ${Number(inv.amount || 0).toLocaleString()}
                      </p>
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
                      <p className="mt-1 font-semibold">
                        {inv.roi_percent != null ? `${inv.roi_percent}%` : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate">As Of</p>
                      <p className="mt-1 font-semibold">{inv.as_of_date || "-"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {hasCrowdfunderHoldings ? (
          <div className="rounded-2xl border border-border bg-white p-6 shadow-card">
            <h3 className="text-lg font-semibold">Crowdfunder Holdings</h3>
            <div className="mt-4 grid gap-3">
              {data.portfolio_allocations.map((allocation) => (
                <div key={allocation.id} className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">
                        {allocation.offering?.title || "Offering"}
                      </p>
                      <p className="text-xs text-slate">Status: {allocation.status}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        ${Number(allocation.amount || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate">Committed</p>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate">Units</p>
                      <p className="mt-1 font-semibold">{allocation.units ?? "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate">Source</p>
                      <p className="mt-1 font-semibold">{allocation.source || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate">As Of</p>
                      <p className="mt-1 font-semibold">{allocation.as_of_date || "-"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {hasFundingActivity ? (
          <div className="rounded-2xl border border-border bg-white p-6 shadow-card">
            <h3 className="text-lg font-semibold">Funding Activity</h3>
            <div className="mt-4 grid gap-3">
              {data.payments?.map((payment) => (
                <div key={`payment-${payment.id}`} className="rounded-xl border border-border p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <p>Payment #{payment.id}</p>
                    <span className="text-xs uppercase tracking-widest text-slate">
                      {payment.status}
                    </span>
                  </div>
                  <p className="mt-2">Investment: #{payment.investment_id}</p>
                  <p>Amount: ${Number(payment.amount || 0).toLocaleString()}</p>
                </div>
              ))}

              {activeFundingItems.map((purchase) => (
                <div key={`purchase-${purchase.id}`} className="rounded-xl border border-border p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{purchase.offering?.title || "Offering"}</p>
                    <span className="text-xs uppercase tracking-widest text-slate">
                      {purchase.status}
                    </span>
                  </div>
                  <p className="mt-2">Reference: {purchase.reference}</p>
                  <p>Provider: {purchase.provider}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Shell>
  );
};

export default InvestorPanel;
