<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DocumentSubmission;
use App\Models\DocumentType;
use App\Services\WorkflowEventService;
use Illuminate\Http\Request;

class InvestorWorkflowController extends Controller
{
    public function submit(Request $request, WorkflowEventService $events)
    {
        $profile = $request->user()->investorProfile;

        if (!$profile->submitted_at) {
            $profile->update(['submitted_at' => now()]);
            $events->record($profile, $profile->status, 'submitted', null, 'Investor submitted profile');
        }

        return response()->json(['profile' => $profile]);
    }

    public function status(Request $request)
    {
        $profile = $request->user()->investorProfile;
        $types = DocumentType::all();
        $submissions = DocumentSubmission::where('user_id', $request->user()->id)->get();

        $items = $types->map(function ($type) use ($profile, $submissions) {
            $required = $type->required_for_track === 'BOTH' || $type->required_for_track === $profile->investor_track;
            $submission = $submissions->firstWhere('document_type_id', $type->id);
            return [
                'document_type_id' => $type->id,
                'name' => $type->name,
                'code' => $type->code,
                'required' => $required,
                'stage' => $type->stage,
                'status' => $submission?->status ?? 'missing',
                'rejection_reason' => $submission?->rejection_reason,
            ];
        });

        return response()->json([
            'profile' => $profile,
            'checklist' => $items,
        ]);
    }

    public function acceptAgreement(Request $request, WorkflowEventService $events)
    {
        $profile = $request->user()->investorProfile;
        $previous = $profile->status;

        if ($profile->status === 'SIGNING_REQUIRED') {
            $profile->update(['status' => 'SIGNED_DOCS_PENDING']);
            $events->record($profile, $previous, $profile->status, null, 'Investor accepted agreement');
        }

        return response()->json(['profile' => $profile]);
    }
}
