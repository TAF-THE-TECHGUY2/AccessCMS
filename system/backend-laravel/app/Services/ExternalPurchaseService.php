<?php

namespace App\Services;

use App\Models\ExternalPurchase;
use App\Models\PortfolioAllocation;
use App\Models\WorkflowEvent;

class ExternalPurchaseService
{
    public function approve(ExternalPurchase $purchase, ?int $adminUserId = null, ?string $notes = null): PortfolioAllocation
    {
        $purchase->update([
            'status' => ExternalPurchase::STATUS_APPROVED,
            'approved_at' => now(),
            'rejected_at' => null,
        ]);

        $allocation = PortfolioAllocation::updateOrCreate(
            [
                'user_id' => $purchase->user_id,
                'offering_id' => $purchase->offering_id,
            ],
            [
                'amount' => $purchase->amount_expected,
                'units' => $purchase->units_expected,
                'status' => PortfolioAllocation::STATUS_ACTIVE,
                'source' => 'external',
                'as_of_date' => now()->toDateString(),
            ]
        );

        WorkflowEvent::create([
            'investor_profile_id' => $purchase->user->investorProfile?->id,
            'from_status' => null,
            'to_status' => 'external_purchase_approved',
            'by_admin_user_id' => $adminUserId,
            'notes' => $notes ?? ('External purchase approved: ' . $purchase->reference),
        ]);

        return $allocation;
    }

    public function reject(ExternalPurchase $purchase, ?int $adminUserId = null, ?string $reason = null): void
    {
        $purchase->update([
            'status' => ExternalPurchase::STATUS_REJECTED,
            'rejected_at' => now(),
        ]);

        WorkflowEvent::create([
            'investor_profile_id' => $purchase->user->investorProfile?->id,
            'from_status' => null,
            'to_status' => 'external_purchase_rejected',
            'by_admin_user_id' => $adminUserId,
            'notes' => $reason ?? ('External purchase rejected: ' . $purchase->reference),
        ]);
    }
}
