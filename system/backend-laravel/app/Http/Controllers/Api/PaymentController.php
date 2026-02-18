<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DocumentSubmission;
use App\Models\DocumentType;
use App\Models\Investment;
use App\Models\Payment;
use App\Services\WorkflowEventService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function uploadProof(Request $request, WorkflowEventService $events)
    {
        $data = $request->validate([
            'investment_id' => ['required', 'exists:investments,id'],
            'amount' => ['required', 'numeric', 'min:1'],
            'file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ]);

        $investment = Investment::with('investorProfile')->findOrFail($data['investment_id']);
        if ($investment->investor_profile_id !== $request->user()->investorProfile->id) {
            return response()->json(['message' => 'Unauthorized investment'], 403);
        }

        $docType = DocumentType::where('code', 'payment_proof')->first();
        if (!$docType) {
            return response()->json(['message' => 'Payment proof document type missing'], 500);
        }

        $disk = config('filesystems.default', 'public');
        $path = $request->file('file')->store('uploads/payments', $disk);
        if (!$path) {
            Log::error('Payment proof upload failed.', ['disk' => $disk, 'user_id' => $request->user()->id]);
            return response()->json(['message' => 'Upload failed'], 500);
        }

        $submission = DocumentSubmission::create([
            'user_id' => $request->user()->id,
            'document_type_id' => $docType->id,
            'file_path' => $path,
            'disk' => $disk,
            'version' => $docType->version,
            'status' => 'pending',
        ]);

        $payment = Payment::create([
            'investment_id' => $investment->id,
            'amount' => $data['amount'],
            'status' => 'pending',
            'proof_document_id' => $submission->id,
        ]);

        $events->record($investment->investorProfile, null, 'payment_proof_uploaded', null, 'Payment #' . $payment->id);

        return response()->json(['payment' => $payment]);
    }
}
