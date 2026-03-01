<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExternalPurchase extends Model
{
    use HasFactory;

    public const STATUS_INITIATED = 'initiated';
    public const STATUS_AWAITING_PROOF = 'awaiting_proof';
    public const STATUS_PENDING_REVIEW = 'pending_review';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'user_id',
        'offering_id',
        'provider',
        'reference',
        'redirect_url',
        'status',
        'amount_expected',
        'units_expected',
        'approved_at',
        'rejected_at',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'amount_expected' => 'decimal:2',
        'units_expected' => 'decimal:4',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function offering()
    {
        return $this->belongsTo(Offering::class);
    }

    public function proofSubmissions()
    {
        return $this->hasMany(DocumentSubmission::class, 'external_purchase_id');
    }
}
