import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

const statusLabels = {
  PENDING_DOCS: "Pending documents",
  DOCS_REJECTED: "Documents rejected",
  DOCS_APPROVED: "Documents approved",
  SIGNING_REQUIRED: "Signing required",
  SIGNED_DOCS_PENDING: "Signed docs pending",
  APPROVED: "Approved",
};

const statusSteps = [
  { key: "PENDING_DOCS", label: "Submit verification docs" },
  { key: "SIGNING_REQUIRED", label: "Sign package" },
  { key: "SIGNED_DOCS_PENDING", label: "Upload signed docs" },
  { key: "APPROVED", label: "Approved" },
];

export default function InvestorDashboard() {
  const { user, logout } = useAuth();
  const [checklist, setChecklist] = useState([]);
  const [status, setStatus] = useState("");
  const [packageFiles, setPackageFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    const data = await api.documents();
    setChecklist(data.items);
    setStatus(data.status);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const loadPackage = async () => {
      if (status === "SIGNING_REQUIRED" || status === "SIGNED_DOCS_PENDING") {
        try {
          const data = await api.package();
          setPackageFiles(data.files || []);
        } catch (err) {
          setError(err.message);
        }
      }
    };
    loadPackage();
  }, [status]);

  const grouped = useMemo(() => {
    return checklist.reduce(
      (acc, item) => {
        acc[item.stage === "signed" ? "signed" : "initial"].push(item);
        return acc;
      },
      { initial: [], signed: [] }
    );
  }, [checklist]);

  const onUpload = async (document_type_id, file) => {
    setMessage("");
    setError("");
    await api.uploadDocument(document_type_id, file);
    await load();
  };

  const activeStepRaw = statusSteps.findIndex((step) => step.key === status);
  const activeStep = activeStepRaw === -1 ? 0 : activeStepRaw;

  const renderChecklist = (items, title, helper) => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-white/60">{helper}</p>
      </div>
      {items.map((item) => (
        <div key={item.document_type_id} className="border border-white/10 rounded-xl p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="font-semibold">{item.name}</div>
              <div className="text-sm text-white/60 mt-1">
                {item.required ? "Required" : "Not required"} · {item.status}
              </div>
              {item.rejection_reason ? (
                <div className="text-sm text-red-400 mt-2">{item.rejection_reason}</div>
              ) : null}
            </div>
            <label
              className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-semibold ${
                item.required ? "bg-white text-black" : "bg-white/20 text-white/50 cursor-not-allowed"
              }`}
            >
              {item.status === "rejected" ? "Re-upload" : "Upload"}
              <input
                type="file"
                className="hidden"
                disabled={!item.required}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUpload(item.document_type_id, file);
                }}
              />
            </label>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-night text-white px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Investor Dashboard</h1>
            <p className="text-sm text-white/60">{user?.email}</p>
          </div>
          <button onClick={logout} className="border border-white/20 px-4 py-2 rounded-xl">
            Logout
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold">Verification checklist</h2>
          <p className="text-sm text-white/60 mt-1">Status: {statusLabels[status] || status}</p>
          {message ? <p className="text-sm text-emerald-400 mt-2">{message}</p> : null}
          {error ? <p className="text-sm text-red-400 mt-2">{error}</p> : null}

          <div className="mt-6 grid gap-4">
            {statusSteps.map((step, index) => (
              <div key={step.key} className="flex items-center gap-3">
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-xs ${
                    index <= activeStep ? "bg-accent text-black" : "bg-white/10 text-white/50"
                  }`}
                >
                  {index + 1}
                </div>
                <div className={index <= activeStep ? "text-white" : "text-white/50"}>{step.label}</div>
              </div>
            ))}
          </div>

          {packageFiles.length ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="text-lg font-semibold">Signing package</h3>
              <p className="text-sm text-white/60 mt-1">Download, sign, and upload the signed PDFs.</p>
              <div className="mt-3 grid md:grid-cols-3 gap-3">
                {packageFiles.map((file) => (
                  <a
                    key={file.key}
                    href={file.url}
                    className="border border-white/10 rounded-xl px-3 py-2 text-sm hover:border-white/40"
                  >
                    Download {file.key}
                  </a>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-8 space-y-8">
            {renderChecklist(grouped.initial, "Initial verification", "Upload your ID, address proof, and tax form.")}
            {renderChecklist(grouped.signed, "Signed documents", "Upload signed PDFs after the package is issued.")}
          </div>
        </div>
      </div>
    </div>
  );
}
