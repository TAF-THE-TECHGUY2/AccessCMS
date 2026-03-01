<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DocumentSubmission;
use App\Models\DocumentType;
use App\Models\ExternalPurchase;
use App\Models\Offering;
use App\Services\InvestorEligibility;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class CrowdfunderPurchaseController extends Controller
{
    public function store(Request $request)
    {
        InvestorEligibility::assertKycApproved($request->user());

        if ($request->user()->role !== 'investor') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $profile = $request->user()->investorProfile;
        if (strtoupper((string) $profile?->investor_track) !== 'CROWDFUNDER') {
            return response()->json(['message' => 'Crowdfunder workflow only.'], 403);
        }

        $data = $request->validate([
            'offering_id' => ['required', 'exists:offerings,id'],
            'amount_expected' => ['nullable', 'numeric', 'min:1'],
            'units_expected' => ['nullable', 'numeric', 'min:0.0001'],
        ]);

        $offering = Offering::findOrFail($data['offering_id']);

        $reference = 'CF-' . Str::upper(Str::ulid()->toBase32());
        $redirectUrl = config('services.wefunder.campaign_url');
        if (! $redirectUrl) {
            return response()->json(['message' => 'Wefunder campaign URL not configured'], 500);
        }

        $purchase = ExternalPurchase::create([
            'user_id' => $request->user()->id,
            'offering_id' => $offering->id,
            'provider' => config('services.wefunder.provider_name', 'wefunder'),
            'reference' => $reference,
            'redirect_url' => $redirectUrl,
            'status' => ExternalPurchase::STATUS_AWAITING_PROOF,
            'amount_expected' => $data['amount_expected'] ?? null,
            'units_expected' => $data['units_expected'] ?? null,
        ]);

        return response()->json([
            'purchase_id' => $purchase->id,
            'mode' => 'EXTERNAL',
            'provider' => $purchase->provider,
            'reference' => $purchase->reference,
            'redirect_url' => $purchase->redirect_url,
        ]);
    }

    public function uploadProof(Request $request, ExternalPurchase $purchase)
    {
        InvestorEligibility::assertKycApproved($request->user());

        if ($request->user()->role !== 'investor') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($purchase->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized purchase'], 403);
        }

        $data = $request->validate([
            'file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'amount' => ['nullable', 'numeric', 'min:1'],
            'units' => ['nullable', 'numeric', 'min:0.0001'],
            'as_of_date' => ['nullable', 'date'],
        ]);

        $docType = DocumentType::where('code', 'shares_confirmation')->first();
        if (! $docType) {
            return response()->json(['message' => 'Shares confirmation document type missing'], 500);
        }

        $disk = config('filesystems.default', 'public');
        $path = $request->file('file')->store('uploads/external', $disk);
        if (! $path) {
            Log::error('Crowdfunder proof upload failed.', ['disk' => $disk, 'user_id' => $request->user()->id]);
            return response()->json(['message' => 'Upload failed'], 500);
        }

        $submission = DocumentSubmission::create([
            'user_id' => $request->user()->id,
            'document_type_id' => $docType->id,
            'external_purchase_id' => $purchase->id,
            'file_path' => $path,
            'disk' => $disk,
            'version' => $docType->version,
            'status' => 'pending',
        ]);

        $purchase->update([
            'status' => ExternalPurchase::STATUS_PENDING_REVIEW,
            'amount_expected' => $data['amount'] ?? $purchase->amount_expected,
            'units_expected' => $data['units'] ?? $purchase->units_expected,
        ]);

        return response()->json([
            'purchase_id' => $purchase->id,
            'status' => $purchase->status,
            'document_id' => $submission->id,
        ]);
    }
}
