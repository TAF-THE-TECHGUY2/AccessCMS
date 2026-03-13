import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Shell from "../../components/Shell";
import { useOnboarding } from "../../lib/onboarding";
import { api } from "../../lib/api";

const DocumentUpload = () => {
  const { uploadDocument, state } = useOnboarding();
  const navigate = useNavigate();
  const [type, setType] = useState("id");
  const [file, setFile] = useState(null);
  const [partnerFile, setPartnerFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [checklist, setChecklist] = useState(null);
  const [loadingChecklist, setLoadingChecklist] = useState(true);

  useEffect(() => {
    let active = true;

    api
      .getChecklist()
      .then((data) => {
        if (!active) return;
        setChecklist(data);
      })
      .catch(() => {
        if (!active) return;
        setChecklist(null);
      })
      .finally(() => {
        if (!active) return;
        setLoadingChecklist(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const partnerProofItem = useMemo(
    () =>
      checklist?.items?.find(
        (item) => item.code === "partner_profile_screenshot" && item.required
      ) || null,
    [checklist]
  );

  const partnerProofStatus = partnerProofItem?.status || "missing";

  const refreshChecklist = async () => {
    const data = await api.getChecklist();
    setChecklist(data);
    return data;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError("Please select a file.");
      return;
    }
    setError("");
    setSuccess("");
    const form = new FormData();
    form.append("type", type);
    form.append("file", file);
    try {
      await uploadDocument(form);
      const nextChecklist = await refreshChecklist().catch(() => checklist);
      setFile(null);

      const needsPartnerProof =
        nextChecklist?.partner_required &&
        nextChecklist?.partner_status !== "approved" &&
        nextChecklist?.items?.some(
          (item) => item.code === "partner_profile_screenshot" && item.required && item.status === "missing"
        );

      if (needsPartnerProof) {
        setSuccess("Identification uploaded. Upload your partner proof to continue review.");
        return;
      }

      navigate(state?.pathway?.pathway === "accredited" ? "/onboarding/accreditation" : "/onboarding/status");
    } catch (err) {
      setError(err?.response?.data?.message || "Upload failed.");
    }
  };

  const submitPartnerProof = async () => {
    if (!partnerProofItem) return;
    if (!partnerFile) {
      setError("Please select your partner proof file.");
      return;
    }

    setError("");
    setSuccess("");

    const form = new FormData();
    form.append("document_type_id", partnerProofItem.document_type_id);
    form.append("file", partnerFile);

    try {
      await api.uploadDocument(form);
      await refreshChecklist();
      setPartnerFile(null);
      setSuccess("Partner proof uploaded. Your compliance team can now review it.");
    } catch (err) {
      setError(err?.response?.data?.message || "Partner proof upload failed.");
    }
  };

  return (
    <Shell>
      <div className="mx-auto max-w-xl space-y-6">
        <h2 className="text-2xl font-semibold">Upload Identification</h2>
        {success ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{success}</div> : null}
        {partnerProofItem ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">Partner proof required</p>
            <p className="mt-2">
              Your crowdfunder profile requires a partner proof upload before KYC can be approved.
            </p>
            <p className="mt-2">
              Current status: <strong>{partnerProofStatus}</strong>
            </p>
          </div>
        ) : null}
        <form className="space-y-4" onSubmit={submit}>
          <div>
            <label className="text-xs uppercase tracking-widest text-slate">Document Type</label>
            <select className="mt-2 w-full rounded-lg border border-border px-4 py-3" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="id">Government ID</option>
              <option value="passport">Passport</option>
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-slate">Upload File</label>
            <input className="mt-2 w-full" type="file" onChange={(e) => setFile(e.target.files[0])} />
          </div>
          {error ? <div className="text-sm text-red-600">{error}</div> : null}
          <button className="rounded-full bg-ink px-6 py-3 text-xs uppercase tracking-widest text-white">
            Upload Identification
          </button>
        </form>

        {partnerProofItem ? (
          <div className="rounded-xl border border-border p-4">
            <h3 className="text-lg font-semibold">Upload Partner Proof</h3>
            <p className="mt-2 text-sm text-slate">
              Submit a screenshot or file that satisfies the required partner proof for your crowdfunder track.
            </p>
            <div className="mt-4">
              <label className="text-xs uppercase tracking-widest text-slate">Partner Proof File</label>
              <input className="mt-2 w-full" type="file" onChange={(e) => setPartnerFile(e.target.files[0])} />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                className="rounded-full bg-ink px-6 py-3 text-xs uppercase tracking-widest text-white"
                onClick={submitPartnerProof}
                type="button"
              >
                Upload Partner Proof
              </button>
              <button
                className="rounded-full border border-border px-6 py-3 text-xs uppercase tracking-widest text-ink"
                onClick={() => navigate("/onboarding/status")}
                type="button"
                disabled={loadingChecklist || partnerProofStatus === "missing"}
              >
                Continue to Review Status
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </Shell>
  );
};

export default DocumentUpload;
