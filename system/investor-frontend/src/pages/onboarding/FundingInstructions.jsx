import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Shell from "../../components/Shell";
import { useOnboarding } from "../../lib/onboarding";
import { api } from "../../lib/api";

const formatPurchaseStatus = (value) => {
  if (!value) return "Unknown";
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const formatDateTime = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
};

const FundingInstructions = () => {
  const navigate = useNavigate();
  const { fetchFunding } = useOnboarding();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [offerings, setOfferings] = useState([]);
  const [selectedOfferingId, setSelectedOfferingId] = useState("");
  const [amountExpected, setAmountExpected] = useState("");
  const [purchaseMessage, setPurchaseMessage] = useState("");
  const [currentPurchase, setCurrentPurchase] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [proofAmount, setProofAmount] = useState("");
  const [proofUnits, setProofUnits] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [submittingPurchase, setSubmittingPurchase] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);

  const refreshExternalPurchases = async () => {
    const dashboard = await api.investorDashboard();
    const purchases = dashboard.external_purchases || [];
    const purchase =
      purchases.find((item) => item.status === "awaiting_proof") ||
      purchases.find((item) => item.status === "pending_review") ||
      purchases[0] ||
      null;

    setCurrentPurchase(purchase);
  };

  useEffect(() => {
    fetchFunding()
      .then((res) => setData(res))
      .catch((err) => setError(err?.response?.data?.message || "Not available yet."));

    api.getOfferings()
      .then((res) => setOfferings(res.offerings || []))
      .catch(() => {});

    refreshExternalPurchases().catch(() => {});
  }, [fetchFunding]);

  const selectedOffering = useMemo(
    () => offerings.find((offering) => String(offering.id) === String(selectedOfferingId)),
    [offerings, selectedOfferingId]
  );

  const pendingReview = currentPurchase?.status === "pending_review";
  const awaitingProof = currentPurchase?.status === "awaiting_proof";
  const approvedPurchase = currentPurchase?.status === "approved";
  const rejectedPurchase = currentPurchase?.status === "rejected";
  const hasOpenPurchase = awaitingProof || pendingReview;
  const createdAtLabel = formatDateTime(currentPurchase?.created_at);

  const startExternalPurchase = async () => {
    setError("");
    setPurchaseMessage("");
    setUploadMessage("");
    setSubmittingPurchase(true);

    try {
      const payload = {
        offering_id: selectedOfferingId,
        amount_expected: amountExpected || undefined
      };
      const result = await api.createCrowdfunderPurchase(payload);

      const purchase = {
        id: result.purchase_id,
        offering: selectedOffering || null,
        provider: result.provider,
        reference: result.reference,
        status: "awaiting_proof",
        amount_expected: amountExpected || null
      };

      setCurrentPurchase(purchase);
      setProofAmount(amountExpected || "");
      setPurchaseMessage(`External purchase created. Reference: ${result.reference}`);

      if (result.redirect_url) {
        window.open(result.redirect_url, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to start the external purchase.");
    } finally {
      setSubmittingPurchase(false);
    }
  };

  const uploadExternalProof = async () => {
    if (!currentPurchase?.id || !proofFile) {
      setError("Choose a proof file before uploading.");
      return;
    }

    setError("");
    setUploadMessage("");
    setUploadingProof(true);

    try {
      const formData = new FormData();
      formData.append("file", proofFile);

      if (proofAmount) {
        formData.append("amount", proofAmount);
      }

      if (proofUnits) {
        formData.append("units", proofUnits);
      }

      await api.uploadCrowdfunderProof(currentPurchase.id, formData);

      setCurrentPurchase((prev) =>
        prev
          ? {
              ...prev,
              status: "pending_review",
              amount_expected: proofAmount || prev.amount_expected,
              units_expected: proofUnits || prev.units_expected
            }
          : prev
      );
      setUploadMessage("Proof uploaded. Your purchase is now pending review.");
      setProofFile(null);
      await refreshExternalPurchases();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to upload proof.");
    } finally {
      setUploadingProof(false);
    }
  };

  return (
    <Shell>
      <div className="mx-auto max-w-2xl space-y-4">
        <h2 className="text-2xl font-semibold">Funding Instructions</h2>
        {error ? <div className="text-sm text-red-600">{error}</div> : null}
        {data ? (
          data.mode === "EXTERNAL" ? (
            <div className="space-y-4 rounded-xl border border-border p-4 text-sm">
              <p>{data.instructions}</p>
              {!approvedPurchase ? (
                <p>
                  <strong>Provider:</strong> {data.provider}
                </p>
              ) : null}
              {data.redirect_url && !approvedPurchase ? (
                <a
                  className="inline-flex rounded-full border border-ink px-4 py-2 text-xs font-semibold text-ink"
                  href={data.redirect_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open external funding page
                </a>
              ) : null}

              {!approvedPurchase ? (
                <div className="rounded-xl border border-border p-4">
                  <h3 className="text-base font-semibold">Create an external purchase</h3>
                  <p className="mt-1 text-sm text-slate">
                    Choose the fund you are purchasing through the external provider.
                  </p>
                  {hasOpenPurchase ? (
                    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                      {pendingReview
                        ? "You already submitted proof for an external purchase. That purchase is waiting for admin review."
                        : "You already have an external purchase in progress. Upload proof for that purchase before starting another one."}
                    </div>
                  ) : null}
                  {rejectedPurchase ? (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                      Your last external purchase was rejected. You can start a new purchase after correcting the issue.
                    </div>
                  ) : null}
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-slate">Choose a fund</label>
                      <select
                        className="mt-2 w-full rounded-lg border border-border px-4 py-3"
                        value={selectedOfferingId}
                        onChange={(e) => setSelectedOfferingId(e.target.value)}
                      >
                        <option value="">Select an offering</option>
                        {offerings.map((offering) => (
                          <option key={offering.id} value={offering.id}>
                            {offering.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-slate">Expected amount (optional)</label>
                      <input
                        className="mt-2 w-full rounded-lg border border-border px-4 py-3"
                        value={amountExpected}
                        onChange={(e) => setAmountExpected(e.target.value)}
                        placeholder="e.g. 1000"
                      />
                    </div>
                    <button
                      className="rounded-full bg-ink px-5 py-3 text-xs font-semibold uppercase tracking-widest text-white disabled:opacity-50"
                      disabled={!selectedOfferingId || submittingPurchase || hasOpenPurchase}
                      onClick={startExternalPurchase}
                    >
                      {submittingPurchase ? "Creating..." : "Create external purchase"}
                    </button>
                    {purchaseMessage ? <div className="text-sm text-emerald-700">{purchaseMessage}</div> : null}
                  </div>
                </div>
              ) : null}

              {currentPurchase ? (
                <div className="rounded-xl border border-border p-4">
                  {approvedPurchase ? (
                    <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                            Purchase Approved
                          </p>
                          <h4 className="mt-2 text-base font-semibold">Your external purchase has been approved.</h4>
                          <p className="mt-1 text-sm text-emerald-800">
                            Your crowdfunding purchase is complete and should now be reflected in your investor dashboard.
                          </p>
                        </div>
                        <span className="rounded-full border border-emerald-300 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-700">
                          Approved
                        </span>
                      </div>
                      <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                        <p>
                          <strong>Reference:</strong> {currentPurchase.reference}
                        </p>
                        {createdAtLabel ? (
                          <p>
                            <strong>Created:</strong> {createdAtLabel}
                          </p>
                        ) : null}
                        {currentPurchase.offering?.title ? (
                          <p className="sm:col-span-2">
                            <strong>Fund:</strong> {currentPurchase.offering.title}
                          </p>
                        ) : null}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          className="rounded-full bg-ink px-5 py-3 text-xs font-semibold uppercase tracking-widest text-white"
                          onClick={() => navigate("/investor")}
                        >
                          Go to investor dashboard
                        </button>
                        <button
                          className="rounded-full border border-ink px-5 py-3 text-xs font-semibold uppercase tracking-widest text-ink"
                          onClick={() => navigate("/dashboard")}
                        >
                          Back to onboarding
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {pendingReview ? (
                    <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                            Proof Submitted
                          </p>
                          <h4 className="mt-2 text-base font-semibold">Your external purchase is waiting for approval.</h4>
                          <p className="mt-1 text-sm text-emerald-800">
                            We received your proof and the team will review it before approving the purchase.
                          </p>
                        </div>
                        <span className="rounded-full border border-emerald-300 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-700">
                          Pending Review
                        </span>
                      </div>
                      <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                        <p>
                          <strong>Reference:</strong> {currentPurchase.reference}
                        </p>
                        {createdAtLabel ? (
                          <p>
                            <strong>Created:</strong> {createdAtLabel}
                          </p>
                        ) : null}
                        {currentPurchase.offering?.title ? (
                          <p className="sm:col-span-2">
                            <strong>Fund:</strong> {currentPurchase.offering.title}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  {!approvedPurchase ? (
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold">Upload proof for this purchase</h3>
                        <p className="mt-1 text-sm text-slate">
                          After completing the external purchase, upload your proof here so the team can review it.
                        </p>
                      </div>
                      <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-widest">
                        {formatPurchaseStatus(currentPurchase.status)}
                      </span>
                    </div>
                  ) : null}

                  <div className="mt-4 space-y-2 text-sm">
                    <p>
                      <strong>Reference:</strong> {currentPurchase.reference}
                    </p>
                    {currentPurchase.offering?.title ? (
                      <p>
                        <strong>Fund:</strong> {currentPurchase.offering.title}
                      </p>
                    ) : null}
                  </div>

                  {!approvedPurchase ? (
                    <div className="mt-4 space-y-3">
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-slate">
                          Proof file
                        </label>
                        <input
                          className="mt-2 block w-full rounded-lg border border-border px-4 py-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-widest file:text-white"
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                        />
                        <p className="mt-2 text-xs text-slate">Accepted formats: PDF, PNG, JPG, JPEG. Max 5MB.</p>
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-widest text-slate">
                          Amount on proof (optional)
                        </label>
                        <input
                          className="mt-2 w-full rounded-lg border border-border px-4 py-3"
                          value={proofAmount}
                          onChange={(e) => setProofAmount(e.target.value)}
                          placeholder="e.g. 1000"
                        />
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-widest text-slate">
                          Units / shares (optional)
                        </label>
                        <input
                          className="mt-2 w-full rounded-lg border border-border px-4 py-3"
                          value={proofUnits}
                          onChange={(e) => setProofUnits(e.target.value)}
                          placeholder="e.g. 10.5"
                        />
                      </div>

                      <button
                        className="rounded-full bg-ink px-5 py-3 text-xs font-semibold uppercase tracking-widest text-white disabled:opacity-50"
                        disabled={!proofFile || uploadingProof || !awaitingProof}
                        onClick={uploadExternalProof}
                      >
                        {uploadingProof ? "Uploading..." : "Upload proof"}
                      </button>

                      {uploadMessage ? <div className="text-sm text-emerald-700">{uploadMessage}</div> : null}
                      {currentPurchase.status === "pending_review" ? (
                        <div className="text-sm text-slate">
                          Proof already submitted. Your purchase is waiting for admin review.
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-xl border border-border p-4 text-sm">
              <p><strong>Bank:</strong> {data.bank_name}</p>
              <p><strong>Account Name:</strong> {data.account_name}</p>
              <p><strong>Routing:</strong> {data.routing_number}</p>
              <p><strong>Account:</strong> {data.account_number}</p>
              <p><strong>Reference:</strong> {data.reference}</p>
            </div>
          )
        ) : null}
      </div>
    </Shell>
  );
};

export default FundingInstructions;
