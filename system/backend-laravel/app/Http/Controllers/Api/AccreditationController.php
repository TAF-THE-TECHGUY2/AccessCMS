<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InvestorOnboarding;
use App\Models\OnboardingDocument;
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
            $disk = config('filesystems.default', 'public');
            $path = $request->file('file')->store('uploads/onboarding', $disk);
            OnboardingDocument::create([
                'onboarding_id' => $onboarding->id,
                'type' => 'accreditation',
                'file_path' => $path,
                'disk' => $disk,
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
        $hasIdDoc = $onboarding->documents()->whereIn('type', ['id', 'passport'])->exists();
        $hasSec = !empty($onboarding->sec_answers);
        if (!$hasProfile || !$hasIdDoc || !$hasSec || !$onboarding->pathway) {
            return;
        }
        $method = $onboarding->sec_answers['accreditation_method'] ?? null;
        $hasAccredDoc = $onboarding->documents()->where('type', 'accreditation')->exists();
        if (!$method && !$hasAccredDoc) {
            return;
        }
        $onboarding->update([
            'review_status' => 'pending',
            'submitted_at' => now(),
        ]);
    }
}
