<?php

namespace App\Services;

use App\Models\InvestorProfile;
use App\Models\User;

class InvestorEligibility
{
    public const ACTIVE_TRACK_STATUSES = [
        InvestorProfile::TRACK_STATUS_ACCREDITED_APPROVED,
        InvestorProfile::TRACK_STATUS_CROWDFUNDER_ACTIVE,
    ];

    public static function isKycApproved(?InvestorProfile $profile): bool
    {
        if (! $profile) {
            return false;
        }

        $status = strtoupper((string) $profile->status);
        $trackStatus = strtoupper((string) $profile->track_status);

        return $status === 'APPROVED'
            && in_array($trackStatus, self::ACTIVE_TRACK_STATUSES, true);
    }

    public static function assertKycApproved(User $user): void
    {
        if ($user->role !== 'investor') {
            return;
        }

        if (! self::isKycApproved($user->investorProfile)) {
            abort(response()->json(['message' => 'KYC not approved yet'], 403));
        }
    }
}
