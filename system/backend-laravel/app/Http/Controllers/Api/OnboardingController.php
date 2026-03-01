<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FundingInstruction;
use App\Models\InvestorOnboarding;
use App\Models\OnboardingProfile;
use App\Models\OnboardingDocument;
use App\Services\InvestorEligibility;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OnboardingController extends Controller
{
    public function basic(Request $request)
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($request->user()->id)],
            'phone' => ['required', 'string', 'max:50'],
        ]);

        $user = $request->user();
        $user->update([
            'name' => "{$data['first_name']} {$data['last_name']}",
            'email' => $data['email'],
            'phone' => $data['phone'],
        ]);

        $onboarding = $this->getOrCreateOnboarding($user->id);

        return response()->json([
            'onboarding' => $onboarding->fresh(),
        ]);
    }

    public function experience(Request $request)
    {
        $this->ensureBasic($request);
        $data = $request->validate([
            'invested_before' => ['required', 'boolean'],
            'planned_amount' => ['required', 'in:<10k,>=10k,unsure'],
        ]);

        $onboarding = $this->requireOnboarding($request);
        $onboarding->update([
            'experience' => $data['invested_before'] ? 'yes' : 'no',
            'investment_amount' => $data['planned_amount'],
        ]);

        return response()->json(['onboarding' => $onboarding->fresh()]);
    }

    public function sec(Request $request)
    {
        $onboarding = $this->requireOnboarding($request);
        if (!$onboarding->experience || !$onboarding->investment_amount) {
            return response()->json(['message' => 'Complete experience step first.'], 409);
        }
        $data = $request->validate([
            'answers' => ['required', 'array'],
        ]);

        $onboarding = $this->requireOnboarding($request);
        $answers = $data['answers'];
        $eligible = collect($answers)->contains(true);
        if (!$eligible) {
            return response()->json([
                'message' => 'At least one SEC eligibility rule must be met.'
            ], 422);
        }

        $onboarding->update(['sec_answers' => $answers]);

        return response()->json(['onboarding' => $onboarding->fresh()]);
    }

    public function pathway(Request $request)
    {
        $onboarding = $this->requireOnboarding($request);
        if (!$onboarding->sec_answers) {
            return response()->json(['message' => 'Complete SEC screening first.'], 409);
        }
        $data = $request->validate([
            'pathway' => ['required', 'in:crowdfunding,accredited'],
        ]);

        $onboarding = $this->requireOnboarding($request);
        $onboarding->update(['pathway' => $data['pathway']]);

        return response()->json(['onboarding' => $onboarding->fresh()]);
    }

    public function profile(Request $request)
    {
        $onboarding = $this->requireOnboarding($request);
        if (!$onboarding->pathway) {
            return response()->json(['message' => 'Select pathway first.'], 409);
        }
        $data = $request->validate([
            'address' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'country' => ['required', 'string', 'max:100'],
            'postal_code' => ['required', 'string', 'max:20'],
            'date_of_birth' => ['required', 'date'],
        ]);

        $profile = OnboardingProfile::updateOrCreate(
            ['onboarding_id' => $onboarding->id],
            $data
        );

        return response()->json([
            'profile' => $profile,
            'onboarding' => $onboarding->fresh(),
        ]);
    }

    public function status(Request $request)
    {
        $onboarding = $this->requireOnboarding($request);

        return response()->json([
            'status' => $onboarding->review_status,
            'rejection_reason' => $onboarding->rejection_reason,
        ]);
    }

    public function state(Request $request)
    {
        $user = $request->user();
        $onboarding = $this->getOrCreateOnboarding($user->id);
        $profile = OnboardingProfile::where('onboarding_id', $onboarding->id)->first();
        $documents = OnboardingDocument::where('onboarding_id', $onboarding->id)
            ->orderByDesc('id')
            ->get(['id', 'type', 'file_path', 'disk', 'created_at']);

        $nameParts = preg_split('/\s+/', trim((string) $user->name), 2);
        $firstName = $nameParts[0] ?? '';
        $lastName = $nameParts[1] ?? '';

        return response()->json([
            'basic' => [
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $user->email,
                'phone' => $user->phone,
            ],
            'experience' => $onboarding->experience ? [
                'invested_before' => $onboarding->experience === 'yes',
                'planned_amount' => $onboarding->investment_amount,
            ] : null,
            'sec' => $onboarding->sec_answers ? ['answers' => $onboarding->sec_answers] : null,
            'pathway' => $onboarding->pathway ? ['pathway' => $onboarding->pathway] : null,
            'profile' => $profile ? [
                'address' => $profile->address,
                'city' => $profile->city,
                'country' => $profile->country,
                'postal_code' => $profile->postal_code,
                'date_of_birth' => $profile->date_of_birth,
            ] : null,
            'documents' => $documents,
        ]);
    }

    public function funding(Request $request)
    {
        InvestorEligibility::assertKycApproved($request->user());

        $onboarding = $this->requireOnboarding($request);
        if ($onboarding->review_status !== 'approved') {
            return response()->json(['message' => 'Funding instructions are not available yet.'], 403);
        }

        $profile = $request->user()->investorProfile;
        if (strtoupper((string) $profile?->investor_track) === 'CROWDFUNDER') {
            return response()->json([
                'mode' => 'EXTERNAL',
                'provider' => config('services.wefunder.provider_name', 'wefunder'),
                'instructions' => 'Complete your investment on Wefunder, then upload your Shares Confirmation for approval.',
                'redirect_url' => config('services.wefunder.campaign_url'),
                'start_purchase_endpoint' => '/api/crowdfunder/purchases',
            ]);
        }

        $instructions = FundingInstruction::where('is_active', true)
            ->orderByDesc('id')
            ->first();

        if (!$instructions) {
            return response()->json(['message' => 'Funding instructions are not configured.'], 404);
        }

        return response()->json([
            'bank_name' => $instructions->bank_name,
            'account_name' => $instructions->account_name,
            'routing_number' => $instructions->routing_number,
            'account_number' => $instructions->account_number,
            'reference' => $this->buildReference($instructions->reference_template, $onboarding->id),
        ]);
    }

    private function buildReference(?string $template, int $onboardingId): string
    {
        $value = $template ?: 'Investor {id}';
        return str_replace('{id}', (string) $onboardingId, $value);
    }

    private function getOrCreateOnboarding(int $userId): InvestorOnboarding
    {
        return InvestorOnboarding::firstOrCreate([
            'user_id' => $userId,
        ], [
            'review_status' => 'draft',
        ]);
    }

    private function requireOnboarding(Request $request): InvestorOnboarding
    {
        return $this->getOrCreateOnboarding($request->user()->id);
    }

    private function ensureBasic(Request $request): void
    {
        $user = $request->user();
        if (!$user->name || !$user->email || !$user->phone) {
            abort(response()->json(['message' => 'Complete basic profile first.'], 409));
        }
    }
}
