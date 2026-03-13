<?php

namespace App\Services;

use App\Models\InvestorOnboarding;
use App\Notifications\OnboardingApproved;
use App\Notifications\OnboardingRejected;

class InvestorOnboardingReviewService
{
    public function __construct(
        private readonly AdminAuditService $adminAudit,
    ) {
    }

    public function approve(InvestorOnboarding $onboarding): InvestorOnboarding
    {
        $onboarding->update([
            'review_status' => 'approved',
            'approved_at' => now(),
            'rejected_at' => null,
            'rejection_reason' => null,
        ]);

        if ($onboarding->user) {
            $onboarding->user->update(['status' => 'approved']);
            $onboarding->user->notify(new OnboardingApproved());
        }

        $this->adminAudit->log('onboarding.approved', $onboarding, [
            'user_id' => $onboarding->user_id,
        ]);

        return $onboarding->refresh();
    }

    public function reject(InvestorOnboarding $onboarding, string $reason): InvestorOnboarding
    {
        $onboarding->update([
            'review_status' => 'rejected',
            'rejected_at' => now(),
            'approved_at' => null,
            'rejection_reason' => $reason,
        ]);

        if ($onboarding->user) {
            $onboarding->user->update(['status' => 'rejected']);
            $onboarding->user->notify(new OnboardingRejected($reason));
        }

        $this->adminAudit->log('onboarding.rejected', $onboarding, [
            'user_id' => $onboarding->user_id,
            'reason' => $reason,
        ]);

        return $onboarding->refresh();
    }
}
