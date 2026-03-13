<?php

namespace App\Services;

use App\Models\InvestorOnboarding;
use App\Models\InvestorProfile;
use App\Models\WorkflowEvent;

class InvestorKycApprovalService
{
    public function blockers(InvestorProfile $profile): array
    {
        $blockers = [];
        $onboarding = $profile->user?->onboarding;

        if (! $onboarding || $onboarding->review_status !== 'approved') {
            $blockers[] = 'Onboarding package must be approved first.';
        }

        if ($profile->isCrowdfunder() && ! $profile->canApproveCrowdfunder()) {
            $blockers[] = 'Approved partner proof is required for crowdfunder KYC.';
        }

        return $blockers;
    }

    public function canApprove(InvestorProfile $profile): bool
    {
        return $this->blockers($profile) === [];
    }

    public function approve(InvestorProfile $profile, int $adminId): array
    {
        $fromStatus = $profile->status;
        $blockers = $this->blockers($profile);

        if ($blockers !== []) {
            if ($profile->isCrowdfunder()) {
                $profile->update([
                    'status' => InvestorProfile::STATUS_NEEDS_PARTNER_PROOF,
                    'track_status' => null,
                ]);

                WorkflowEvent::create([
                    'investor_profile_id' => $profile->id,
                    'from_status' => $fromStatus,
                    'to_status' => InvestorProfile::STATUS_NEEDS_PARTNER_PROOF,
                    'by_admin_user_id' => $adminId,
                    'notes' => implode(' ', $blockers),
                ]);
            }

            app(AdminAuditService::class)->log('investor.kyc_blocked', $profile, [
                'from_status' => $fromStatus,
                'blockers' => $blockers,
            ]);

            return ['approved' => false, 'blockers' => $blockers];
        }

        $trackStatus = $profile->investor_type === InvestorProfile::INVESTOR_TYPE_CROWDFUNDER
            ? InvestorProfile::TRACK_STATUS_CROWDFUNDER_ACTIVE
            : InvestorProfile::TRACK_STATUS_ACCREDITED_APPROVED;

        $profile->update([
            'status' => InvestorProfile::STATUS_APPROVED,
            'track_status' => $trackStatus,
            'approved_at' => now(),
            'rejected_at' => null,
        ]);

        WorkflowEvent::create([
            'investor_profile_id' => $profile->id,
            'from_status' => $fromStatus,
            'to_status' => InvestorProfile::STATUS_APPROVED,
            'by_admin_user_id' => $adminId,
            'notes' => 'Investor approved.',
        ]);

        app(AdminAuditService::class)->log('investor.approved', $profile, [
            'from_status' => $fromStatus,
            'track_status' => $trackStatus,
        ]);

        return ['approved' => true, 'track_status' => $trackStatus, 'blockers' => []];
    }
}
