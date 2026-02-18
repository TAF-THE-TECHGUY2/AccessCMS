<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdminAuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'admin_user_id',
        'action',
        'auditable_type',
        'auditable_id',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_user_id');
    }
}
