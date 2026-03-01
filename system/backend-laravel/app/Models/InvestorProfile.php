<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvestorProfile extends Model
{
    use HasFactory;

    public const STATUS_PENDING_REVIEW = 'pending_review';
    public const STATUS_NEEDS_PARTNER_PROOF = 'needs_partner_proof';
    public const STATUS_NEEDS_MORE_DOCS = 'needs_more_docs';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

    public const INVESTOR_TYPE_ACCREDITED = 'accredited';
    public const INVESTOR_TYPE_CROWDFUNDER = 'crowdfunder';

    public const TRACK_STATUS_ACCREDITED_APPROVED = 'ACCREDITED_APPROVED';
    public const TRACK_STATUS_CROWDFUNDER_ACTIVE = 'CROWDFUNDER_ACTIVE';

    protected $fillable = [
        'user_id',
        'investor_type',
        'profile_type',
        'full_name',
        'title',
        'phone',
        'email',
        'address_line1',
        'address_line2',
        'city',
        'state',
        'postal_code',
        'country',
        'effective_date',
        'capital_contribution_amount',
        'units_purchased',
        'equity_percent',
        'investor_track',
        'status',
        'track_status',
        'partner_required',
        'partner_status',
        'partner_profile_url',
        'partner_rejection_reason',
        'partner_reviewed_by',
        'partner_reviewed_at',
        'submitted_at',
        'approved_at',
        'rejected_at',
    ];

    protected $casts = [
        'effective_date' => 'date',
        'capital_contribution_amount' => 'decimal:2',
        'equity_percent' => 'decimal:3',
        'partner_required' => 'boolean',
        'partner_reviewed_at' => 'datetime',
        'submitted_at' => 'datetime',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function entity()
    {
        return $this->hasOne(InvestorEntity::class);
    }

    public function workflowEvents()
    {
        return $this->hasMany(WorkflowEvent::class);
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    public function investments()
    {
        return $this->hasMany(Investment::class);
    }

    public function payments()
    {
        return $this->hasManyThrough(Payment::class, Investment::class);
    }

    public function bankAccounts()
    {
        return $this->hasMany(BankAccount::class);
    }

    public function isCrowdfunder(): bool
    {
        return $this->investor_type === self::INVESTOR_TYPE_CROWDFUNDER;
    }

    public function canApproveCrowdfunder(): bool
    {
        if (! $this->isCrowdfunder()) {
            return true;
        }

        if ($this->partner_status !== 'approved') {
            return false;
        }

        return $this->documents()
            ->where('type', Document::TYPE_PARTNER_PROFILE_SCREENSHOT)
            ->where('status', Document::STATUS_APPROVED)
            ->exists();
    }
}
