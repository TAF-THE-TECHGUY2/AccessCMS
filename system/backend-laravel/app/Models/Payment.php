<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'investment_id',
        'amount',
        'status',
        'proof_document_id',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function investment()
    {
        return $this->belongsTo(Investment::class);
    }

    public function proofDocument()
    {
        return $this->belongsTo(DocumentSubmission::class, 'proof_document_id');
    }
}
