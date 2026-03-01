<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'document_type_id',
        'external_purchase_id',
        'file_path',
        'disk',
        'version',
        'status',
        'rejection_reason',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function documentType()
    {
        return $this->belongsTo(DocumentType::class);
    }

    public function externalPurchase()
    {
        return $this->belongsTo(ExternalPurchase::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function isPartnerProof(): bool
    {
        return $this->documentType?->code === 'partner_profile_screenshot';
    }

    public function isSharesConfirmation(): bool
    {
        return $this->documentType?->code === 'shares_confirmation';
    }
}
