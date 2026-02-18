<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvestorEntity extends Model
{
    use HasFactory;

    protected $fillable = [
        'investor_profile_id',
        'legal_name',
        'registration_no',
        'jurisdiction',
        'beneficial_owners_json',
    ];

    protected $casts = [
        'beneficial_owners_json' => 'array',
    ];

    public function investorProfile()
    {
        return $this->belongsTo(InvestorProfile::class);
    }
}
