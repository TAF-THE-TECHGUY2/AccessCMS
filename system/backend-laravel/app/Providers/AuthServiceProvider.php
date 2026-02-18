<?php

namespace App\Providers;

use App\Models\DocumentSubmission;
use App\Policies\DocumentSubmissionPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        DocumentSubmission::class => DocumentSubmissionPolicy::class,
    ];
}
