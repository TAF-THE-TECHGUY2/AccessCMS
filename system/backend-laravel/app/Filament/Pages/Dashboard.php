<?php

namespace App\Filament\Pages;

use App\Filament\Resources\DocumentSubmissionResource;
use App\Filament\Resources\ExternalPurchaseResource;
use App\Filament\Resources\FundingInstructionResource;
use App\Filament\Resources\InvestorOnboardingResource;
use App\Filament\Resources\InvestorProfileResource;
use App\Filament\Resources\OfferingResource;
use App\Filament\Resources\PaymentResource;
use App\Models\DocumentSubmission;
use App\Models\ExternalPurchase;
use App\Models\InvestorOnboarding;
use App\Models\InvestorProfile;
use App\Models\Payment;
use App\Services\DocumentSubmissionReviewService;
use App\Services\InvestorEligibility;
use App\Services\InvestorKycApprovalService;
use App\Services\InvestorOnboardingReviewService;
use Filament\Pages\Page;
use Filament\Notifications\Notification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class Dashboard extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-home';

    protected static ?string $navigationLabel = 'Dashboard';

    protected static ?string $title = 'Dashboard';

    protected static string $view = 'filament.pages.dashboard';

    protected function getViewData(): array
    {
        $pendingOnboardings = InvestorOnboarding::query()
            ->with(['user'])
            ->where('review_status', 'pending')
            ->orderByDesc('submitted_at')
            ->limit(6)
            ->get();

        $pendingSubmissions = DocumentSubmission::query()
            ->with(['user', 'documentType'])
            ->where('status', 'pending')
            ->orderByDesc('created_at')
            ->limit(8)
            ->get();

        $readyForKyc = InvestorOnboarding::query()
            ->with(['user.investorProfile'])
            ->where('review_status', 'approved')
            ->orderByDesc('approved_at')
            ->get()
            ->filter(function (InvestorOnboarding $onboarding) {
                $profile = $onboarding->user?->investorProfile;

                return $profile && ! InvestorEligibility::isKycApproved($profile);
            })
            ->take(6)
            ->values();

        $pendingPayments = Payment::query()
            ->with(['investment.investorProfile', 'proofDocument.documentType'])
            ->where('status', 'pending')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        $pendingExternalPurchases = ExternalPurchase::query()
            ->with(['user', 'offering'])
            ->where('status', ExternalPurchase::STATUS_PENDING_REVIEW)
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        $rejectedOnboardings = InvestorOnboarding::query()
            ->with(['user'])
            ->where('review_status', 'rejected')
            ->orderByDesc('rejected_at')
            ->limit(4)
            ->get();

        $rejectedSubmissions = DocumentSubmission::query()
            ->with(['user', 'documentType'])
            ->where('status', 'rejected')
            ->orderByDesc('reviewed_at')
            ->limit(4)
            ->get();

        $stats = [
            [
                'label' => 'Pending Compliance Reviews',
                'value' => InvestorOnboarding::query()->where('review_status', 'pending')->count(),
                'description' => 'Onboarding packages waiting for compliance review.',
                'url' => InvestorOnboardingResource::getUrl('index'),
            ],
            [
                'label' => 'Pending Document Reviews',
                'value' => DocumentSubmission::query()->where('status', 'pending')->count(),
                'description' => 'Partner proof, payment proof, shares confirmations, and other submissions.',
                'url' => DocumentSubmissionResource::getUrl('index'),
            ],
            [
                'label' => 'Ready For KYC Approval',
                'value' => InvestorOnboarding::query()
                    ->with(['user.investorProfile'])
                    ->where('review_status', 'approved')
                    ->get()
                    ->filter(fn (InvestorOnboarding $onboarding) => $onboarding->user?->investorProfile && ! InvestorEligibility::isKycApproved($onboarding->user->investorProfile))
                    ->count(),
                'description' => 'Approved onboarding packages still waiting on KYC approval.',
                'url' => InvestorProfileResource::getUrl('index'),
            ],
            [
                'label' => 'Funding Ops Queue',
                'value' => Payment::query()->where('status', 'pending')->count()
                    + ExternalPurchase::query()->where('status', ExternalPurchase::STATUS_PENDING_REVIEW)->count(),
                'description' => 'Pending payment proofs and external purchases awaiting review.',
                'url' => PaymentResource::getUrl('index'),
            ],
        ];

        return [
            'stats' => $stats,
            'pendingOnboardings' => $pendingOnboardings,
            'pendingSubmissions' => $pendingSubmissions,
            'readyForKyc' => $readyForKyc,
            'pendingPayments' => $pendingPayments,
            'pendingExternalPurchases' => $pendingExternalPurchases,
            'rejectedOnboardings' => $rejectedOnboardings,
            'rejectedSubmissions' => $rejectedSubmissions,
            'quickLinks' => [
                [
                    'label' => 'Investor Onboardings',
                    'description' => 'Approve or reject onboarding packages.',
                    'url' => InvestorOnboardingResource::getUrl('index'),
                ],
                [
                    'label' => 'Document Submissions',
                    'description' => 'Review partner proof, shares confirmations, and payment proofs.',
                    'url' => DocumentSubmissionResource::getUrl('index'),
                ],
                [
                    'label' => 'Investor Profiles',
                    'description' => 'Approve KYC once the required prerequisites are satisfied.',
                    'url' => InvestorProfileResource::getUrl('index'),
                ],
                [
                    'label' => 'External Purchases',
                    'description' => 'Monitor crowdfunder funding and shares confirmations.',
                    'url' => ExternalPurchaseResource::getUrl('index'),
                ],
                [
                    'label' => 'Payments',
                    'description' => 'Review direct funding payment proofs.',
                    'url' => PaymentResource::getUrl('index'),
                ],
                [
                    'label' => 'Funding Instructions',
                    'description' => 'Maintain active bank and wire instructions.',
                    'url' => FundingInstructionResource::getUrl('index'),
                ],
                [
                    'label' => 'Offerings',
                    'description' => 'Confirm available funds and portfolio options.',
                    'url' => OfferingResource::getUrl('index'),
                ],
            ],
        ];
    }

    public function statusBadgeClass(string $status): string
    {
        return match (strtolower($status)) {
            'approved', 'active', 'complete' => 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200',
            'pending', 'pending_review', 'submitted', 'open' => 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
            'rejected', 'needs_partner_proof', 'needs_more_docs', 'blocked' => 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200',
            default => 'bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200',
        };
    }

    public function formatStatus(?string $value): string
    {
        return $value ? Str::headline(str_replace('-', '_', $value)) : '—';
    }

    public function waitingLabel(?Carbon $timestamp): string
    {
        if (! $timestamp) {
            return 'waiting —';
        }

        $days = $timestamp->diffInDays(now());
        if ($days >= 1) {
            return "waiting {$days}d";
        }

        $hours = max(1, $timestamp->diffInHours(now()));

        return "waiting {$hours}h";
    }

    public function onboardingUrl(InvestorOnboarding $onboarding): string
    {
        return InvestorOnboardingResource::getUrl('edit', ['record' => $onboarding]);
    }

    public function submissionUrl(DocumentSubmission $submission): string
    {
        return DocumentSubmissionResource::getUrl('view', ['record' => $submission]);
    }

    public function investorProfileUrl(InvestorProfile $profile): string
    {
        return InvestorProfileResource::getUrl('view', ['record' => $profile]);
    }

    public function approveInvestor(int $profileId): void
    {
        $profile = InvestorProfile::findOrFail($profileId);
        $result = app(InvestorKycApprovalService::class)->approve($profile, auth()->id());

        if (! $result['approved']) {
            Notification::make()
                ->title('Investor cannot be approved yet')
                ->warning()
                ->body(implode(' ', $result['blockers']))
                ->send();

            return;
        }

        Notification::make()
            ->title('Investor approved')
            ->success()
            ->body("Track status set to {$result['track_status']}.")
            ->send();
    }

    public function approveOnboarding(int $onboardingId): void
    {
        $onboarding = InvestorOnboarding::findOrFail($onboardingId);
        app(InvestorOnboardingReviewService::class)->approve($onboarding);

        Notification::make()
            ->title('Onboarding package approved')
            ->success()
            ->body('The compliance review is now approved.')
            ->send();
    }

    public function approveSubmission(int $submissionId): void
    {
        $submission = DocumentSubmission::findOrFail($submissionId);
        app(DocumentSubmissionReviewService::class)->approve($submission, auth()->id());

        Notification::make()
            ->title('Document submission approved')
            ->success()
            ->body(($submission->documentType?->name ?: 'Document') . ' has been approved.')
            ->send();
    }

    public function paymentUrl(Payment $payment): string
    {
        return PaymentResource::getUrl('edit', ['record' => $payment]);
    }

    public function externalPurchaseUrl(ExternalPurchase $purchase): string
    {
        return ExternalPurchaseResource::getUrl('edit', ['record' => $purchase]);
    }
}
