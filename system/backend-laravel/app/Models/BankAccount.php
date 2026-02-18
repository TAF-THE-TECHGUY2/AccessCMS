<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BankAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'investor_profile_id',
        'encrypted_payload',
        'last4',
        'bank_name',
        'account_holder',
    ];

    public function investorProfile()
    {
        return $this->belongsTo(InvestorProfile::class);
    }
}
