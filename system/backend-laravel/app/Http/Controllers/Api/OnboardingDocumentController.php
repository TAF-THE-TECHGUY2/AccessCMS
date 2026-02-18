<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InvestorOnboarding;
use App\Models\OnboardingDocument;
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

        $disk = config('filesystems.default', 'public');
        $path = $request->file('file')->store('uploads/onboarding', $disk);
        if (!$path) {
            Log::error('Onboarding document upload failed.', ['disk' => $disk, 'user_id' => $request->user()->id]);
            return response()->json(['message' => 'Upload failed'], 500);
        }

        $doc = OnboardingDocument::create([
            'onboarding_id' => $onboarding->id,
            'type' => $data['type'],
            'file_path' => $path,
            'disk' => $disk,
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
        $hasIdDoc = $onboarding->documents()->whereIn('type', ['id', 'passport'])->exists();
        $hasSec = !empty($onboarding->sec_answers);
        if (!$hasProfile || !$hasIdDoc || !$hasSec || !$onboarding->pathway) {
            return;
        }

        if ($onboarding->pathway === 'accredited') {
            $method = $onboarding->sec_answers['accreditation_method'] ?? null;
            $hasAccredDoc = $onboarding->documents()->where('type', 'accreditation')->exists();
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
