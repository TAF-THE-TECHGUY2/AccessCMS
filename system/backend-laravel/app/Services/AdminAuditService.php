<?php

namespace App\Services;

use App\Models\AdminAuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class AdminAuditService
{
    public function log(string $action, ?Model $auditable = null, array $metadata = []): AdminAuditLog
    {
        return AdminAuditLog::create([
            'admin_user_id' => Auth::id(),
            'action' => $action,
            'auditable_type' => $auditable ? $auditable::class : null,
            'auditable_id' => $auditable?->getKey(),
            'metadata' => $metadata ?: null,
        ]);
    }
}
