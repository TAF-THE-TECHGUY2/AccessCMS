<?php

namespace App\Policies;

use App\Models\DocumentSubmission;
use App\Models\User;

class DocumentSubmissionPolicy
{
    public function view(User $user, DocumentSubmission $submission): bool
    {
        return $user->role === 'admin' || $submission->user_id === $user->id;
    }
}
