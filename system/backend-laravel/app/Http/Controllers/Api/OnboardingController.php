<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DocumentSubmission;
use App\Models\DocumentType;
use App\Models\FundingInstruction;
use App\Models\InvestorOnboarding;
use App\Models\OnboardingProfile;
use App\Services\InvestorEligibility;
use App\Services\PlatformConfigService;
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

        $onboarding->update(['sec_answers' => $data['answers']]);

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

        if ($onboarding->pathway && $onboarding->pathway !== $data['pathway']) {
            return response()->json([
                'message' => 'Pathway is already set by the assistant and cannot be changed here.',
            ], 409);
        }

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
        $documentTypes = DocumentType::query()
            ->whereIn('code', ['government_id', 'accreditation_evidence'])
            ->pluck('id', 'code');
        $documents = DocumentSubmission::query()
            ->where('user_id', $user->id)
            ->whereIn('document_type_id', $documentTypes->values())
            ->with('documentType')
            ->orderByDesc('id')
            ->get()
            ->map(fn (DocumentSubmission $document) => [
                'id' => $document->id,
                'type' => $document->documentType?->code,
                'name' => $document->documentType?->name,
                'status' => $document->status,
                'rejection_reason' => $document->rejection_reason,
                'file_path' => $document->file_path,
                'disk' => $document->disk,
                'created_at' => $document->created_at,
            ]);

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
            'accreditation' => $this->buildAccreditationState($onboarding),
            'verification_provider' => [
                'name' => app(PlatformConfigService::class)->verifyProviderName(),
                'url' => app(PlatformConfigService::class)->verifyVerificationUrl(),
            ],
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

    public function overview(Request $request)
    {
        $user = $request->user();
        $onboarding = $this->getOrCreateOnboarding($user->id);
        $onboardingProfile = OnboardingProfile::where('onboarding_id', $onboarding->id)->first();
        $investorProfile = $user->investorProfile;

        $identityType = DocumentType::where('code', 'government_id')->first();
        $identityDocument = $identityType
            ? DocumentSubmission::query()
                ->where('user_id', $user->id)
                ->where('document_type_id', $identityType->id)
                ->latest('id')
                ->first()
            : null;

        $accreditationType = DocumentType::where('code', 'accreditation_evidence')->first();
        $accreditationDocument = $accreditationType
            ? DocumentSubmission::query()
                ->where('user_id', $user->id)
                ->where('document_type_id', $accreditationType->id)
                ->latest('id')
                ->first()
            : null;

        $partnerProofType = DocumentType::where('code', 'partner_profile_screenshot')->first();
        $partnerProofRequired = false;
        $partnerProofSubmission = null;
        $partnerProofStatus = 'not_required';

        if ($investorProfile && $partnerProofType) {
            $partnerProofRequired =
                $partnerProofType->required_for_track === 'BOTH' ||
                $partnerProofType->required_for_track === $investorProfile->investor_track;

            if ($partnerProofRequired) {
                $partnerProofSubmission = DocumentSubmission::query()
                    ->where('user_id', $user->id)
                    ->where('document_type_id', $partnerProofType->id)
                    ->latest('id')
                    ->first();

                $partnerProofStatus = $partnerProofSubmission?->status ?? 'missing';
                if ($investorProfile->partner_status === 'approved') {
                    $partnerProofStatus = 'approved';
                } elseif ($investorProfile->partner_status === 'submitted' && $partnerProofStatus === 'missing') {
                    $partnerProofStatus = 'pending';
                }
            }
        }

        $accreditationState = $this->buildAccreditationState($onboarding);
        $isAccredited = $onboarding->pathway === 'accredited';
        $reviewStatus = $onboarding->review_status ?: 'draft';
        $kycApproved = InvestorEligibility::isKycApproved($investorProfile);
        $fundingMode = null;
        $fundingAvailable = false;

        if ($reviewStatus === 'approved' && $kycApproved) {
            $fundingAvailable = true;
            $fundingMode = strtoupper((string) $investorProfile?->investor_track) === 'CROWDFUNDER'
                ? 'EXTERNAL'
                : 'DIRECT';
        }

        $tasks = [];

        $tasks[] = [
            'key' => 'profile',
            'title' => 'Complete your profile',
            'description' => 'Add address details and date of birth so compliance can review your account.',
            'status' => $onboardingProfile ? 'complete' : 'open',
            'href' => '/onboarding/profile',
            'required' => true,
        ];

        $tasks[] = [
            'key' => 'identity_documents',
            'title' => 'Upload identity documents',
            'description' => $identityDocument
                ? 'Your identity document has been uploaded and is waiting for review.'
                : 'Provide your government ID or passport so Access Properties can verify your identity.',
            'status' => $identityDocument?->status ?? 'open',
            'rejection_reason' => $identityDocument?->rejection_reason,
            'href' => '/onboarding/documents',
            'required' => true,
        ];

        $tasks[] = [
            'key' => 'partner_proof',
            'title' => 'Upload partner proof',
            'description' => $partnerProofRequired
                ? 'Crowdfunder accounts that require partner proof must upload and clear this document before KYC can be approved.'
                : 'Not required for your pathway.',
            'status' => $partnerProofRequired ? $partnerProofStatus : 'not_required',
            'rejection_reason' => $partnerProofSubmission?->rejection_reason,
            'href' => '/onboarding/documents',
            'required' => $partnerProofRequired,
        ];

        $tasks[] = [
            'key' => 'accreditation',
            'title' => 'Verify accredited status',
            'description' => $isAccredited
                ? 'Submit your accredited investor verification before compliance approval.'
                : 'Not required for your pathway.',
            'status' => $isAccredited
                ? ($accreditationDocument?->status ?? ($accreditationState ? 'submitted' : 'open'))
                : 'not_required',
            'rejection_reason' => $accreditationDocument?->rejection_reason,
            'href' => '/onboarding/accreditation',
            'required' => $isAccredited,
        ];

        $tasks[] = [
            'key' => 'review',
            'title' => 'Compliance review',
            'description' => match ($reviewStatus) {
                'approved' => 'Your onboarding package has been approved.',
                'rejected' => 'Your onboarding package needs changes before it can move forward.',
                'pending' => 'Your onboarding package is with compliance for review.',
                default => 'Your onboarding package is not yet ready for compliance review.',
            },
            'status' => $reviewStatus,
            'href' => '/onboarding/status',
            'required' => true,
        ];

        $tasks[] = [
            'key' => 'kyc',
            'title' => 'KYC approval',
            'description' => $kycApproved
                ? 'KYC has been approved and your account can proceed to funding.'
                : 'KYC approval happens after compliance has approved the required documents for your pathway.',
            'status' => $kycApproved ? 'complete' : 'blocked',
            'href' => '/onboarding/status',
            'required' => true,
        ];

        $tasks[] = [
            'key' => 'funding',
            'title' => $fundingMode === 'EXTERNAL' ? 'Start funding on the external platform' : 'Funding instructions',
            'description' => $fundingAvailable
                ? ($fundingMode === 'EXTERNAL'
                    ? 'Start your external purchase and then upload your shares confirmation.'
                    : 'Bank or wire instructions are now available for your investment transfer.')
                : 'Funding unlocks after both compliance review and KYC approval are complete.',
            'status' => $fundingAvailable ? 'open' : 'blocked',
            'href' => '/onboarding/funding',
            'required' => true,
        ];

        $nextTask = collect($tasks)->first(function (array $task) {
            return in_array($task['status'], ['open', 'rejected'], true);
        }) ?? collect($tasks)->first(function (array $task) {
            return $task['status'] === 'submitted';
        }) ?? collect($tasks)->first(function (array $task) {
            return $task['status'] === 'blocked';
        });

        $blockingReasons = [];
        if (! $onboardingProfile) {
            $blockingReasons[] = 'Complete your full profile.';
        }
        if (! $identityDocument) {
            $blockingReasons[] = 'Upload an identity document.';
        }
        if ($partnerProofRequired && $partnerProofStatus !== 'approved') {
            $blockingReasons[] = 'Partner proof must be approved for crowdfunder KYC.';
        }
        if ($isAccredited && ! $accreditationState) {
            $blockingReasons[] = 'Submit accredited investor verification.';
        }
        if ($reviewStatus !== 'approved') {
            $blockingReasons[] = $reviewStatus === 'rejected'
                ? 'Resolve the rejected onboarding review items.'
                : 'Wait for onboarding package approval.';
        }
        if (! $kycApproved) {
            $blockingReasons[] = 'KYC approval is still pending.';
        }

        return response()->json([
            'pathway' => $onboarding->pathway,
            'pathway_label' => match ($onboarding->pathway) {
                'accredited' => 'Accredited Investor',
                'crowdfunding' => 'Crowdfunding',
                default => 'Not set',
            },
            'planned_amount' => $onboarding->investment_amount,
            'review_status' => $reviewStatus,
            'review_rejection_reason' => $onboarding->rejection_reason,
            'profile_complete' => (bool) $onboardingProfile,
            'identity_document' => [
                'submitted' => (bool) $identityDocument,
                'status' => $identityDocument?->status ?? 'missing',
                'rejection_reason' => $identityDocument?->rejection_reason,
                'type' => $identityDocument?->documentType?->code,
            ],
            'partner_proof' => [
                'required' => $partnerProofRequired,
                'status' => $partnerProofStatus,
                'rejection_reason' => $partnerProofSubmission?->rejection_reason,
            ],
            'accreditation' => $accreditationState,
            'kyc' => [
                'approved' => $kycApproved,
                'profile_status' => $investorProfile?->status,
                'track_status' => $investorProfile?->track_status,
            ],
            'funding' => [
                'available' => $fundingAvailable,
                'mode' => $fundingMode,
            ],
            'tasks' => $tasks,
            'next_task' => $nextTask,
            'blocking_reasons' => $blockingReasons,
        ]);
    }

    public function funding(Request $request, PlatformConfigService $platformConfig)
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
                'provider' => $platformConfig->wefunderProviderName(),
                'instructions' => 'Complete your investment on Wefunder, then upload your Shares Confirmation for approval.',
                'redirect_url' => $platformConfig->wefunderCampaignUrl(),
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

    private function buildAccreditationState(InvestorOnboarding $onboarding): ?array
    {
        if ($onboarding->pathway !== 'accredited') {
            return null;
        }

        $method = $onboarding->sec_answers['accreditation_method'] ?? null;
        $verificationCode = $onboarding->sec_answers['verification_code'] ?? null;
        $documentType = DocumentType::where('code', 'accreditation_evidence')->first();
        $submission = $documentType
            ? DocumentSubmission::query()
                ->where('user_id', $onboarding->user_id)
                ->where('document_type_id', $documentType->id)
                ->latest('id')
                ->first()
            : null;
        $hasDocument = (bool) $submission;

        if (! $method && ! $hasDocument) {
            return null;
        }

        return [
            'method' => $method,
            'verification_code' => $verificationCode,
            'document_uploaded' => $hasDocument,
            'status' => $submission?->status ?? ($method ? 'submitted' : 'missing'),
            'rejection_reason' => $submission?->rejection_reason,
            'provider_name' => app(PlatformConfigService::class)->verifyProviderName(),
            'verification_url' => app(PlatformConfigService::class)->verifyVerificationUrl(),
        ];
    }
}
