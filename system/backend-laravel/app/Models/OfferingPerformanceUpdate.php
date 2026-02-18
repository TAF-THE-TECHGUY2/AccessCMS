<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OfferingPerformanceUpdate extends Model
{
    use HasFactory;

    protected $fillable = [
        'offering_id',
        'as_of_date',
        'roi_percent',
        'nav_per_unit',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'as_of_date' => 'date',
        'roi_percent' => 'decimal:3',
        'nav_per_unit' => 'decimal:4',
    ];

    public function offering()
    {
        return $this->belongsTo(Offering::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
