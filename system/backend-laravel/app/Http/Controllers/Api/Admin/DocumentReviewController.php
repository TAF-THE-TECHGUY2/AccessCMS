<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\DocumentSubmission;
use App\Models\DocumentType;
use App\Models\Payment;
use App\Services\AdminAuditService;
use App\Services\DocumentPackageService;
use App\Services\WorkflowEventService;
use Illuminate\Http\Request;

class DocumentReviewController extends Controller
{
    public function approve(Request $request, DocumentSubmission $submission, DocumentPackageService $service, WorkflowEventService $events)
    {
        $submission->update([
            'status' => 'approved',
            'rejection_reason' => null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        $events->record(
            $submission->user->investorProfile,
            null,
            'document_approved',
            $submission->reviewed_by,
            $submission->documentType?->name
        );

        if ($submission->isPartnerProof()) {
            $this->updatePartnerStatus($submission, $events, 'approved', null);
        }

        if ($submission->documentType?->code === 'payment_proof') {
            $this->updatePaymentStatus($submission, $events, 'approved', null);
        }

        $this->updateInvestorStatus($submission, $service, $events);

        app(AdminAuditService::class)->log('document_submission.approved', $submission, [
            'document_type' => $submission->documentType?->code,
            'user_id' => $submission->user_id,
        ]);

        return response()->json(['submission' => $submission]);
    }

    public function reject(Request $request, DocumentSubmission $submission, WorkflowEventService $events)
    {
        $data = $request->validate(['reason' => ['required', 'string', 'max:1000']]);
        $submission->update([
            'status' => 'rejected',
            'rejection_reason' => $data['reason'],
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        $events->record(
            $submission->user->investorProfile,
            null,
            'document_rejected',
            $submission->reviewed_by,
            $submission->documentType?->name . ': ' . $data['reason']
        );

        $profile = $submission->user->investorProfile;
        $profile->update([
            'status' => 'DOCS_REJECTED',
            'track_status' => null,
            'rejected_at' => now(),
        ]);

        if ($submission->isPartnerProof()) {
            $this->updatePartnerStatus($submission, $events, 'rejected', $data['reason']);
        }

        if ($submission->documentType?->code === 'payment_proof') {
            $this->updatePaymentStatus($submission, $events, 'rejected', $data['reason']);
        }

        app(AdminAuditService::class)->log('document_submission.rejected', $submission, [
            'document_type' => $submission->documentType?->code,
            'user_id' => $submission->user_id,
            'reason' => $data['reason'],
        ]);

        return response()->json(['submission' => $submission]);
    }

    private function updateInvestorStatus(DocumentSubmission $submission, DocumentPackageService $service, WorkflowEventService $events): void
    {
        $profile = $submission->user->investorProfile;
        $previousStatus = $profile->status;
        $types = DocumentType::all();
        $requiredInitial = $types->where('stage', 'initial')->filter(function ($type) use ($profile) {
            return $type->required_for_track === 'BOTH' || $type->required_for_track === $profile->investor_track;
        });

        $approved = DocumentSubmission::where('user_id', $submission->user_id)
            ->whereIn('document_type_id', $requiredInitial->pluck('id'))
            ->where('status', 'approved')
            ->count();

        if ($approved === $requiredInitial->count()) {
            $profile->update([
                'status' => 'SIGNING_REQUIRED',
                'effective_date' => now(),
            ]);
            $service->generateFor($profile);
        } else {
            $profile->update(['status' => 'PENDING_DOCS']);
        }

        if ($profile->status !== $previousStatus) {
            $events->record($profile, $previousStatus, $profile->status, $submission->reviewed_by);
            $previousStatus = $profile->status;
        }

        $requiredSigned = $types->where('stage', 'signed')->filter(function ($type) use ($profile) {
            return $type->required_for_track === 'BOTH' || $type->required_for_track === $profile->investor_track;
        });

        $approvedSigned = DocumentSubmission::where('user_id', $submission->user_id)
            ->whereIn('document_type_id', $requiredSigned->pluck('id'))
            ->where('status', 'approved')
            ->count();

        if ($requiredSigned->count() > 0 && $approvedSigned === $requiredSigned->count()) {
            $trackStatus = $profile->investor_track === 'ACCREDITED'
                ? \App\Models\InvestorProfile::TRACK_STATUS_ACCREDITED_APPROVED
                : \App\Models\InvestorProfile::TRACK_STATUS_CROWDFUNDER_ACTIVE;
            $profile->update([
                'status' => 'APPROVED',
                'track_status' => $trackStatus,
                'approved_at' => now(),
            ]);
            if ($profile->status !== $previousStatus) {
                $events->record($profile, $previousStatus, $profile->status, $submission->reviewed_by);
            }
        }
    }

    private function updatePartnerStatus(DocumentSubmission $submission, WorkflowEventService $events, string $status, ?string $reason): void
    {
        $profile = $submission->user->investorProfile;
        $previous = $profile->partner_status;

        $profile->update([
            'partner_status' => $status,
            'partner_rejection_reason' => $reason,
            'partner_reviewed_by' => $submission->reviewed_by,
            'partner_reviewed_at' => $submission->reviewed_at,
        ]);

        $events->record(
            $profile,
            $previous,
            'partner_' . $status,
            $submission->reviewed_by,
            $reason
        );
    }

    private function updatePaymentStatus(DocumentSubmission $submission, WorkflowEventService $events, string $status, ?string $reason): void
    {
        $payment = Payment::where('proof_document_id', $submission->id)->first();
        if (!$payment) {
            return;
        }

        $payment->update(['status' => $status]);
        if ($status === 'approved') {
            $payment->investment?->update(['status' => 'active']);
        }
        $events->record(
            $submission->user->investorProfile,
            null,
            'payment_' . $status,
            $submission->reviewed_by,
            $reason
        );
    }
}
