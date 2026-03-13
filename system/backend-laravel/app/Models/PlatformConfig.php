<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlatformConfig extends Model
{
    protected $fillable = [
        'wefunder_campaign_url',
        'wefunder_provider_name',
        'verify_verification_url',
        'verify_provider_name',
    ];
}
