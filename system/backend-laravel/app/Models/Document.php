<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Document extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

    public const TYPE_PARTNER_PROFILE_SCREENSHOT = 'partner_profile_screenshot';

    protected $fillable = [
        'investor_profile_id',
        'type',
        'status',
        'path',
        'disk',
        'reviewed_by',
        'reviewed_at',
        'rejection_reason',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function investorProfile()
    {
        return $this->belongsTo(InvestorProfile::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function getSignedUrl(): string
    {
        $disk = $this->disk ?: 'public';
        $storage = Storage::disk($disk);

        if (method_exists($storage, 'temporaryUrl')) {
            return $storage->temporaryUrl($this->path, Carbon::now()->addMinutes(10));
        }

        return $storage->url($this->path);
    }
}
