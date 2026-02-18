<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OnboardingDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'onboarding_id',
        'type',
        'file_path',
        'disk',
    ];

    public function onboarding()
    {
        return $this->belongsTo(InvestorOnboarding::class, 'onboarding_id');
    }
}
