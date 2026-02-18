import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Shell from "../../components/Shell";
import { useOnboarding } from "../../lib/onboarding";

const DocumentUpload = () => {
  const { uploadDocument, state } = useOnboarding();
  const navigate = useNavigate();
  const [type, setType] = useState("id");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError("Please select a file.");
      return;
    }
    setError("");
    const form = new FormData();
    form.append("type", type);
    form.append("file", file);
    try {
      await uploadDocument(form);
      navigate(state?.pathway?.pathway === "accredited" ? "/onboarding/accreditation" : "/onboarding/status");
    } catch (err) {
      setError(err?.response?.data?.message || "Upload failed.");
    }
  };

  return (
    <Shell>
      <div className="mx-auto max-w-xl space-y-6">
        <h2 className="text-2xl font-semibold">Upload Identification</h2>
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
            Continue
          </button>
        </form>
      </div>
    </Shell>
  );
};

export default DocumentUpload;
