import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Shell from "../../components/Shell";
import { api } from "../../lib/api";

const statusLabels = {
  draft: "Draft",
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    const load = () => {
      api.onboardingOverview().then(setOverview).catch(() => setOverview(null));
    };

    load();
    const interval = setInterval(() => {
      load();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const tasks = useMemo(() => {
    if (!overview?.tasks) return [];

    return overview.tasks.map((task) => ({
      ...task,
      done: task.status === "complete" || task.status === "approved",
      disabled: task.status === "not_required",
      cta:
        task.status === "complete" || task.status === "approved"
          ? "Review"
          : task.status === "submitted" || task.status === "pending"
            ? "View status"
            : task.status === "blocked"
              ? "View requirements"
              : "Open",
    }));
  }, [overview]);

  const actionableTasks = useMemo(
    () => tasks.filter((task) => !task.done && !task.disabled),
    [tasks]
  );

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.done),
    [tasks]
  );

  const nextTask = useMemo(() => {
    if (overview?.next_task) {
      return {
        ...overview.next_task,
        cta:
          overview.next_task.status === "blocked"
            ? "View requirements"
            : overview.next_task.status === "submitted"
              ? "View status"
              : "Open",
      };
    }

    return tasks.find((task) => !task.done && !task.disabled) || null;
  }, [overview, tasks]);

  return (
    <Shell>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-border bg-white p-6 shadow-card sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate">Onboarding Dashboard</p>
            <h1 className="mt-3 text-3xl font-semibold text-ink">Complete your onboarding</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate">
              Your pathway is already set. Finish the remaining steps below and funding will unlock automatically.
            </p>
          </div>
          {nextTask ? (
            <button
              className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white"
              onClick={() => navigate(nextTask.href)}
            >
              {nextTask.cta}
            </button>
          ) : null}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="space-y-4">
            {actionableTasks.length ? actionableTasks.map((task) => (
              <div key={task.key} className="rounded-3xl border border-border bg-white p-6 shadow-card">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-semibold text-ink">{task.title}</h2>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          task.done
                            ? "bg-black text-white"
                            : task.status === "submitted" || task.status === "pending"
                              ? "bg-stone-200 text-ink"
                              : task.disabled
                              ? "bg-stone-100 text-stone-500"
                              : "bg-stone-100 text-ink"
                        }`}
                      >
                        {task.done
                          ? "Done"
                          : task.status === "submitted" || task.status === "pending"
                            ? "Pending"
                            : task.disabled
                              ? "Not required"
                              : task.status === "blocked"
                                ? "Blocked"
                                : "Open"}
                      </span>
                    </div>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate">{task.description}</p>
                    {task.rejection_reason ? (
                      <p className="mt-2 text-sm text-red-600">Reason: {task.rejection_reason}</p>
                    ) : null}
                  </div>
                  <button
                    className="rounded-full border border-ink px-5 py-3 text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:border-stone-200 disabled:text-stone-400"
                    onClick={() => navigate(task.href)}
                    disabled={task.disabled}
                  >
                    {task.cta}
                  </button>
                </div>
              </div>
            )) : (
              <div className="rounded-3xl border border-border bg-white p-6 shadow-card">
                <h2 className="text-xl font-semibold text-ink">All onboarding steps are complete</h2>
                <p className="mt-2 text-sm leading-6 text-slate">
                  There is nothing left to submit here. Move to your investor dashboard to monitor holdings and documents.
                </p>
                <div className="mt-4">
                  <button
                    className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white"
                    onClick={() => navigate("/investor")}
                  >
                    Go to investor dashboard
                  </button>
                </div>
              </div>
            )}

          </section>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-border bg-white p-6 shadow-card">
              <p className="text-xs uppercase tracking-[0.22em] text-slate">Next action</p>
              <h3 className="mt-3 text-xl font-semibold text-ink">
                {nextTask ? nextTask.title : "You’re clear to monitor your dashboard"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate">
                {nextTask
                  ? nextTask.description
                  : "All onboarding tasks are complete. Use the investor panel to monitor investments and documents."}
              </p>
              {overview?.blocking_reasons?.length ? (
                <ul className="mt-4 space-y-2 text-sm text-slate">
                  {overview.blocking_reasons.map((reason) => (
                    <li key={reason}>• {reason}</li>
                  ))}
                </ul>
              ) : null}
              {overview?.pathway_label ? (
                <div className="mt-4 border-t border-border pt-4 text-sm text-slate">
                  <span className="font-medium text-ink">Pathway:</span> {overview.pathway_label}
                </div>
              ) : null}
            </div>
            {overview?.review_rejection_reason ? (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-card">
                <p className="text-xs uppercase tracking-[0.22em] text-red-700">Needs attention</p>
                <p className="mt-3 text-sm leading-6 text-red-800">{overview.review_rejection_reason}</p>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </Shell>
  );
};

export default Dashboard;
