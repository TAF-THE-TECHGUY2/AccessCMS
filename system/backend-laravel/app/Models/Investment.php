<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Investment extends Model
{
    use HasFactory;

    protected $fillable = [
        'investor_profile_id',
        'offering_id',
        'amount',
        'status',
        'funded_at',
        'approved_at',
        'rejected_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'funded_at' => 'datetime',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];

    public function investorProfile()
    {
        return $this->belongsTo(InvestorProfile::class);
    }

    public function offering()
    {
        return $this->belongsTo(Offering::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function performanceUpdates()
    {
        return $this->hasMany(InvestmentPerformanceUpdate::class);
    }
}
