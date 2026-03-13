<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\DocumentSubmission;
use App\Services\DocumentSubmissionReviewService;
use Illuminate\Http\Request;

class DocumentReviewController extends Controller
{
    public function approve(Request $request, DocumentSubmission $submission, DocumentSubmissionReviewService $reviewService)
    {
        $reviewService->approve($submission, $request->user()->id);

        return response()->json(['submission' => $submission]);
    }

    public function reject(Request $request, DocumentSubmission $submission, DocumentSubmissionReviewService $reviewService)
    {
        $data = $request->validate(['reason' => ['required', 'string', 'max:1000']]);
        $reviewService->reject($submission, $request->user()->id, $data['reason']);

        return response()->json(['submission' => $submission]);
    }
}
