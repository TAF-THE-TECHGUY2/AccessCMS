<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DocumentSubmission;
use App\Models\DocumentType;
use App\Models\InvestorOnboarding;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class OnboardingDocumentController extends Controller
{
    public function upload(Request $request)
    {
        $data = $request->validate([
            'type' => ['required', 'in:id,passport,accreditation'],
            'file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ]);

        $onboarding = InvestorOnboarding::firstOrCreate([
            'user_id' => $request->user()->id,
        ], [
            'review_status' => 'draft',
        ]);

        if (!$onboarding->pathway) {
            return response()->json(['message' => 'Complete pathway selection first.'], 409);
        }

        $typeCode = match ($data['type']) {
            'id', 'passport' => 'government_id',
            'accreditation' => 'accreditation_evidence',
        };

        $documentType = DocumentType::where('code', $typeCode)->first();
        if (! $documentType) {
            return response()->json(['message' => 'Document type is not configured.'], 500);
        }

        $disk = config('filesystems.default', 'public');
        $path = $request->file('file')->store('uploads/onboarding', $disk);
        if (!$path) {
            Log::error('Onboarding document upload failed.', ['disk' => $disk, 'user_id' => $request->user()->id]);
            return response()->json(['message' => 'Upload failed'], 500);
        }

        $doc = DocumentSubmission::updateOrCreate([
            'user_id' => $request->user()->id,
            'document_type_id' => $documentType->id,
        ], [
            'file_path' => $path,
            'disk' => $disk,
            'version' => $documentType->version,
            'status' => 'pending',
            'rejection_reason' => null,
            'reviewed_by' => null,
            'reviewed_at' => null,
        ]);

        $this->markSubmittedIfReady($onboarding);

        return response()->json(['document' => $doc]);
    }

    private function markSubmittedIfReady(InvestorOnboarding $onboarding): void
    {
        if ($onboarding->review_status !== 'draft') {
            return;
        }
        $hasProfile = $onboarding->profile()->exists();
        $identityType = DocumentType::where('code', 'government_id')->first();
        $hasIdDoc = $identityType
            ? DocumentSubmission::where('user_id', $onboarding->user_id)
                ->where('document_type_id', $identityType->id)
                ->exists()
            : false;
        $hasSec = !empty($onboarding->sec_answers);
        if (!$hasProfile || !$hasIdDoc || !$hasSec || !$onboarding->pathway) {
            return;
        }

        if ($onboarding->pathway === 'accredited') {
            $method = $onboarding->sec_answers['accreditation_method'] ?? null;
            $accreditationType = DocumentType::where('code', 'accreditation_evidence')->first();
            $hasAccredDoc = $accreditationType
                ? DocumentSubmission::where('user_id', $onboarding->user_id)
                    ->where('document_type_id', $accreditationType->id)
                    ->exists()
                : false;
            if (!$method && !$hasAccredDoc) {
                return;
            }
        }

        $onboarding->update([
            'review_status' => 'pending',
            'submitted_at' => now(),
        ]);
    }
}
