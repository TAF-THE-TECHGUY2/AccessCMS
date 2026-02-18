<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkflowEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'investor_profile_id',
        'from_status',
        'to_status',
        'by_admin_user_id',
        'notes',
    ];

    public function investorProfile()
    {
        return $this->belongsTo(InvestorProfile::class);
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'by_admin_user_id');
    }
}
