<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PortfolioAllocation extends Model
{
    use HasFactory;

    public const STATUS_ACTIVE = 'active';
    public const STATUS_INACTIVE = 'inactive';

    protected $fillable = [
        'user_id',
        'offering_id',
        'amount',
        'units',
        'source',
        'status',
        'as_of_date',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'units' => 'decimal:4',
        'as_of_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function offering()
    {
        return $this->belongsTo(Offering::class);
    }
}
