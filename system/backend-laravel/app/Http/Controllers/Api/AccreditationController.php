<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DocumentSubmission;
use App\Models\DocumentType;
use App\Models\InvestorOnboarding;
use Illuminate\Http\Request;

class AccreditationController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'method' => ['required', 'in:external,upload'],
            'verification_code' => ['nullable', 'string', 'max:255'],
            'file' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ]);

        $onboarding = InvestorOnboarding::firstOrCreate([
            'user_id' => $request->user()->id,
        ], [
            'review_status' => 'draft',
        ]);

        if ($onboarding->pathway !== 'accredited') {
            return response()->json(['message' => 'Accreditation is only required for accredited pathway.'], 409);
        }

        $answers = $onboarding->sec_answers ?? [];
        $answers['accreditation_method'] = $data['method'];
        $answers['verification_code'] = $data['verification_code'] ?? null;
        $onboarding->update(['sec_answers' => $answers]);

        if ($data['method'] === 'upload') {
            if (!$request->hasFile('file')) {
                return response()->json(['message' => 'Verification letter is required.'], 422);
            }
            $documentType = DocumentType::where('code', 'accreditation_evidence')->first();
            if (! $documentType) {
                return response()->json(['message' => 'Accreditation document type is not configured.'], 500);
            }
            $disk = config('filesystems.default', 'public');
            $path = $request->file('file')->store('uploads/onboarding', $disk);
            DocumentSubmission::updateOrCreate([
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
        }

        $this->markSubmittedIfReady($onboarding);

        return response()->json(['onboarding' => $onboarding->fresh()]);
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
        $onboarding->update([
            'review_status' => 'pending',
            'submitted_at' => now(),
        ]);
    }
}
