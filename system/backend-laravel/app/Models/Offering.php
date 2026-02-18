<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Offering extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'summary',
        'target_amount',
        'min_investment',
        'max_investment',
        'status',
        'opened_at',
        'closed_at',
    ];

    protected $casts = [
        'target_amount' => 'decimal:2',
        'min_investment' => 'decimal:2',
        'max_investment' => 'decimal:2',
        'opened_at' => 'date',
        'closed_at' => 'date',
    ];

    public function investments()
    {
        return $this->hasMany(Investment::class);
    }

    public function performanceUpdates()
    {
        return $this->hasMany(OfferingPerformanceUpdate::class);
    }
}
