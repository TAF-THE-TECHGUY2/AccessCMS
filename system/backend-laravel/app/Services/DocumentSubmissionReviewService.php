<?php

namespace App\Services;

use App\Models\DocumentSubmission;
use App\Models\DocumentType;
use App\Models\InvestorProfile;
use App\Models\Payment;

class DocumentSubmissionReviewService
{
    public function __construct(
        private readonly DocumentPackageService $documentPackageService,
        private readonly WorkflowEventService $workflowEvents,
        private readonly AdminAuditService $adminAudit,
    ) {
    }

    public function approve(DocumentSubmission $submission, int $reviewedBy): DocumentSubmission
    {
        $submission->update([
            'status' => 'approved',
            'rejection_reason' => null,
            'reviewed_by' => $reviewedBy,
            'reviewed_at' => now(),
        ]);

        $this->workflowEvents->record(
            $submission->user->investorProfile,
            null,
            'document_approved',
            $reviewedBy,
            $submission->documentType?->name
        );

        if ($submission->isPartnerProof()) {
            $this->updatePartnerStatus($submission, 'approved', null);
        }

        if ($submission->documentType?->code === 'payment_proof') {
            $this->updatePaymentStatus($submission, 'approved', null);
        }

        $this->updateInvestorStatus($submission);

        $this->adminAudit->log('document_submission.approved', $submission, [
            'document_type' => $submission->documentType?->code,
            'user_id' => $submission->user_id,
        ]);

        return $submission->refresh();
    }

    public function reject(DocumentSubmission $submission, int $reviewedBy, string $reason): DocumentSubmission
    {
        $submission->update([
            'status' => 'rejected',
            'rejection_reason' => $reason,
            'reviewed_by' => $reviewedBy,
            'reviewed_at' => now(),
        ]);

        $this->workflowEvents->record(
            $submission->user->investorProfile,
            null,
            'document_rejected',
            $reviewedBy,
            $submission->documentType?->name . ': ' . $reason
        );

        $profile = $submission->user->investorProfile;
        $profile->update([
            'status' => 'DOCS_REJECTED',
            'track_status' => null,
            'rejected_at' => now(),
        ]);

        if ($submission->isPartnerProof()) {
            $this->updatePartnerStatus($submission, 'rejected', $reason);
        }

        if ($submission->documentType?->code === 'payment_proof') {
            $this->updatePaymentStatus($submission, 'rejected', $reason);
        }

        $this->adminAudit->log('document_submission.rejected', $submission, [
            'document_type' => $submission->documentType?->code,
            'user_id' => $submission->user_id,
            'reason' => $reason,
        ]);

        return $submission->refresh();
    }

    private function updateInvestorStatus(DocumentSubmission $submission): void
    {
        $profile = $submission->user->investorProfile;
        $previousStatus = $profile->status;
        $types = DocumentType::all();
        $requiredInitial = $types->where('stage', 'initial')->filter(function ($type) use ($profile) {
            return $type->required_for_track === 'BOTH' || $type->required_for_track === $profile->investor_track;
        });

        $approved = DocumentSubmission::query()
            ->where('user_id', $submission->user_id)
            ->whereIn('document_type_id', $requiredInitial->pluck('id'))
            ->where('status', 'approved')
            ->count();

        if ($approved === $requiredInitial->count()) {
            $profile->update([
                'status' => 'SIGNING_REQUIRED',
                'effective_date' => now(),
            ]);
            $this->documentPackageService->generateFor($profile);
        } else {
            $profile->update(['status' => 'PENDING_DOCS']);
        }

        if ($profile->status !== $previousStatus) {
            $this->workflowEvents->record($profile, $previousStatus, $profile->status, $submission->reviewed_by);
            $previousStatus = $profile->status;
        }

        $requiredSigned = $types->where('stage', 'signed')->filter(function ($type) use ($profile) {
            return $type->required_for_track === 'BOTH' || $type->required_for_track === $profile->investor_track;
        });

        $approvedSigned = DocumentSubmission::query()
            ->where('user_id', $submission->user_id)
            ->whereIn('document_type_id', $requiredSigned->pluck('id'))
            ->where('status', 'approved')
            ->count();

        if ($requiredSigned->count() > 0 && $approvedSigned === $requiredSigned->count()) {
            $trackStatus = $profile->investor_track === 'ACCREDITED'
                ? InvestorProfile::TRACK_STATUS_ACCREDITED_APPROVED
                : InvestorProfile::TRACK_STATUS_CROWDFUNDER_ACTIVE;

            $profile->update([
                'status' => 'APPROVED',
                'track_status' => $trackStatus,
                'approved_at' => now(),
            ]);

            if ($profile->status !== $previousStatus) {
                $this->workflowEvents->record($profile, $previousStatus, $profile->status, $submission->reviewed_by);
            }
        }
    }

    private function updatePartnerStatus(DocumentSubmission $submission, string $status, ?string $reason): void
    {
        $profile = $submission->user->investorProfile;
        $previous = $profile->partner_status;

        $profile->update([
            'partner_status' => $status,
            'partner_rejection_reason' => $reason,
            'partner_reviewed_by' => $submission->reviewed_by,
            'partner_reviewed_at' => $submission->reviewed_at,
        ]);

        $this->workflowEvents->record(
            $profile,
            $previous,
            'partner_' . $status,
            $submission->reviewed_by,
            $reason
        );
    }

    private function updatePaymentStatus(DocumentSubmission $submission, string $status, ?string $reason): void
    {
        $payment = Payment::where('proof_document_id', $submission->id)->first();
        if (! $payment) {
            return;
        }

        $payment->update(['status' => $status]);
        if ($status === 'approved') {
            $payment->investment?->update(['status' => 'active']);
        }

        $this->workflowEvents->record(
            $submission->user->investorProfile,
            null,
            'payment_' . $status,
            $submission->reviewed_by,
            $reason
        );
    }
}
