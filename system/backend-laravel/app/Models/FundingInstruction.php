<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FundingInstruction extends Model
{
    use HasFactory;

    protected $fillable = [
        'bank_name',
        'account_name',
        'routing_number',
        'account_number',
        'reference_template',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
