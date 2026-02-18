<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OnboardingProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'onboarding_id',
        'address',
        'city',
        'country',
        'postal_code',
        'date_of_birth',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
    ];

    public function onboarding()
    {
        return $this->belongsTo(InvestorOnboarding::class, 'onboarding_id');
    }
}
