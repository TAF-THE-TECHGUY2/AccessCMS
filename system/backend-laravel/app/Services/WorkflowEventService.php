<?php

namespace App\Services;

use App\Models\InvestorProfile;
use App\Models\WorkflowEvent;

class WorkflowEventService
{
    public function record(InvestorProfile $profile, ?string $from, string $to, ?int $adminId = null, ?string $notes = null): WorkflowEvent
    {
        return WorkflowEvent::create([
            'investor_profile_id' => $profile->id,
            'from_status' => $from,
            'to_status' => $to,
            'by_admin_user_id' => $adminId,
            'notes' => $notes,
        ]);
    }
}
