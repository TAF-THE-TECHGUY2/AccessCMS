<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class InvestorOnboarding extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'experience',
        'investment_amount',
        'sec_answers',
        'pathway',
        'review_status',
        'rejection_reason',
        'submitted_at',
        'approved_at',
        'rejected_at',
    ];

    protected $casts = [
        'sec_answers' => 'array',
        'submitted_at' => 'datetime',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function profile(): HasOne
    {
        return $this->hasOne(OnboardingProfile::class, 'onboarding_id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(OnboardingDocument::class, 'onboarding_id');
    }
}
