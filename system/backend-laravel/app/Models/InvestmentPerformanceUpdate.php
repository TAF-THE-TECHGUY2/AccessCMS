<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvestmentPerformanceUpdate extends Model
{
    use HasFactory;

    protected $fillable = [
        'investment_id',
        'as_of_date',
        'roi_percent',
        'current_value',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'as_of_date' => 'date',
        'roi_percent' => 'decimal:3',
        'current_value' => 'decimal:2',
    ];

    public function investment()
    {
        return $this->belongsTo(Investment::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
