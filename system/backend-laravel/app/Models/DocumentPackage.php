<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentPackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'generated_files',
        'status',
        'sent_at',
        'signed_at',
    ];

    protected $casts = [
        'generated_files' => 'array',
        'sent_at' => 'datetime',
        'signed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
