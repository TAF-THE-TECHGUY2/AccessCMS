<?php

namespace App\Filament\Resources\InvestorProfileResource\Pages;

use App\Filament\Resources\DocumentSubmissionResource;
use App\Filament\Resources\InvestorProfileResource;
use App\Models\DocumentSubmission;
use App\Models\InvestorProfile;
use App\Services\DocumentSubmissionReviewService;
use App\Services\InvestorKycApprovalService;
use Filament\Actions;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class ViewInvestorProfile extends ViewRecord
{
    protected static string $resource = InvestorProfileResource::class;

    protected static string $view = 'filament.resources.investor-profile-resource.pages.view-investor-profile';

    public function getTitle(): string
    {
        return $this->record->full_name ?: 'Investor Profile';
    }

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('approveKyc')
                ->label('Approve KYC')
                ->color('success')
                ->requiresConfirmation()
                ->action(function (): void {
                    $result = app(InvestorKycApprovalService::class)->approve($this->record, Auth::id());

                    if (! $result['approved']) {
                        Notification::make()
                            ->title('Investor cannot be approved yet')
                            ->warning()
                            ->body(implode(' ', $result['blockers']))
                            ->send();

                        return;
                    }

                    Notification::make()
                        ->title('KYC approved')
                        ->success()
                        ->body("Status set to Approved and track status set to {$result['track_status']}.")
                        ->send();
                }),
            Actions\EditAction::make(),
        ];
    }

    public function statusBadgeClass(?string $status): string
    {
        return match (strtolower((string) $status)) {
            'approved', 'active', 'complete' => 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200 dark:bg-green-500/15 dark:text-green-300 dark:ring-green-500/30',
            'pending', 'pending_review', 'submitted' => 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30',
            'rejected', 'needs_partner_proof', 'needs_more_docs', 'blocked', 'missing' => 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-500/30',
            'not_required' => 'bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-200 dark:bg-white/10 dark:text-gray-300 dark:ring-white/10',
            default => 'bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200 dark:bg-white/10 dark:text-gray-200 dark:ring-white/10',
        };
    }

    public function formatStatus(?string $value): string
    {
        return $value ? Str::headline(str_replace('-', '_', $value)) : '—';
    }

    public function documentStatuses(): array
    {
        $record = $this->record;

        return [
            [
                'label' => 'Identity',
                'status' => $this->documentStatusFor(['government_id']),
            ],
            [
                'label' => 'Partner Proof',
                'status' => $record->partner_required
                    ? $this->documentStatusFor(['partner_profile_screenshot'])
                    : 'not_required',
            ],
            [
                'label' => 'Accreditation',
                'status' => $record->investor_type === InvestorProfile::INVESTOR_TYPE_ACCREDITED
                    ? $this->documentStatusFor(['accreditation_evidence'])
                    : 'not_required',
            ],
            [
                'label' => 'Shares Confirmation',
                'status' => $record->investor_type === InvestorProfile::INVESTOR_TYPE_CROWDFUNDER
                    ? $this->documentStatusFor(['shares_confirmation'])
                    : 'not_required',
            ],
        ];
    }

    public function complianceItems(): array
    {
        $record = $this->record;

        return [
            $this->buildComplianceItem('Identity', ['government_id']),
            $this->buildComplianceItem(
                'Partner Proof',
                ['partner_profile_screenshot'],
                ! $record->partner_required
            ),
            $this->buildComplianceItem(
                'Accreditation',
                ['accreditation_evidence'],
                $record->investor_type !== InvestorProfile::INVESTOR_TYPE_ACCREDITED
            ),
            $this->buildComplianceItem(
                'Shares Confirmation',
                ['shares_confirmation'],
                $record->investor_type !== InvestorProfile::INVESTOR_TYPE_CROWDFUNDER
            ),
        ];
    }

    public function latestDocumentIssues(): array
    {
        return $this->record->documentSubmissions()
            ->with('documentType')
            ->where('status', 'rejected')
            ->latest('reviewed_at')
            ->limit(3)
            ->get()
            ->map(function (DocumentSubmission $submission): array {
                return [
                    'label' => $submission->documentType?->name ?: 'Document',
                    'reason' => $submission->rejection_reason ?: 'Rejected',
                ];
            })
            ->all();
    }

    public function holdingStats(): array
    {
        $record = $this->record;

        return [
            'direct_count' => $record->investments()->count(),
            'crowdfunder_count' => $record->portfolioAllocations()->count(),
            'direct_total' => (float) $record->investments()->sum('amount'),
            'crowdfunder_total' => (float) $record->portfolioAllocations()->sum('amount'),
        ];
    }

    public function blockers(): array
    {
        $blockers = [];

        foreach (app(InvestorKycApprovalService::class)->blockers($this->record) as $blocker) {
            $blockers[] = $blocker;
        }

        if ($this->record->status === InvestorProfile::STATUS_REJECTED) {
            $blockers[] = 'Investor profile is currently rejected.';
        }

        if ($this->record->status === InvestorProfile::STATUS_NEEDS_MORE_DOCS) {
            $blockers[] = 'Additional documents have been requested.';
        }

        return array_values(array_unique($blockers));
    }

    public function recentActivity(): array
    {
        return $this->record->workflowEvents()
            ->with('admin')
            ->latest('created_at')
            ->limit(5)
            ->get()
            ->map(fn ($event) => [
                'title' => $this->formatStatus($event->to_status),
                'detail' => $event->notes ?: 'Status updated.',
                'by' => $event->admin?->name ?: 'System',
                'at' => $event->created_at?->diffForHumans() ?: '—',
            ])
            ->all();
    }

    public function profileRows(): array
    {
        return [
            ['label' => 'Email', 'value' => $this->record->email ?: '—'],
            ['label' => 'Phone', 'value' => $this->record->phone ?: '—'],
            ['label' => 'Profile Type', 'value' => $this->record->profile_type ?: '—'],
            ['label' => 'Address', 'value' => collect([
                $this->record->address_line1,
                $this->record->address_line2,
                $this->record->city,
                $this->record->state,
                $this->record->postal_code,
                $this->record->country,
            ])->filter()->implode(', ') ?: '—'],
            ['label' => 'Submitted', 'value' => $this->record->submitted_at?->diffForHumans() ?: '—'],
            ['label' => 'Approved', 'value' => $this->record->approved_at?->diffForHumans() ?: '—'],
        ];
    }

    public function approveDocumentSubmission(int $submissionId): void
    {
        $submission = $this->record->documentSubmissions()->find($submissionId);

        if (! $submission) {
            Notification::make()
                ->title('Document not found')
                ->danger()
                ->body('The selected document is no longer available on this investor profile.')
                ->send();

            return;
        }

        if (! in_array($submission->status, ['pending', 'submitted', 'pending_review'], true)) {
            Notification::make()
                ->title('Document cannot be approved')
                ->warning()
                ->body('Only pending submissions can be approved from this page.')
                ->send();

            return;
        }

        app(DocumentSubmissionReviewService::class)->approve($submission, Auth::id());

        Notification::make()
            ->title('Document approved')
            ->success()
            ->body(($submission->documentType?->name ?: 'Document') . ' was approved.')
            ->send();
    }

    protected function documentStatusFor(array $codes): string
    {
        $submission = $this->record->documentSubmissions()
            ->whereHas('documentType', function ($query) use ($codes) {
                $query->whereIn('code', $codes);
            })
            ->latest('created_at')
            ->first();

        return $submission?->status ?? 'missing';
    }

    protected function buildComplianceItem(string $label, array $codes, bool $notRequired = false): array
    {
        if ($notRequired) {
            return [
                'label' => $label,
                'status' => 'not_required',
                'detail' => 'Not required for this investor.',
                'reason' => null,
                'submission_id' => null,
                'review_url' => null,
                'can_approve' => false,
            ];
        }

        $submission = $this->record->documentSubmissions()
            ->with('documentType')
            ->whereHas('documentType', function ($query) use ($codes) {
                $query->whereIn('code', $codes);
            })
            ->latest('created_at')
            ->first();

        if (! $submission) {
            return [
                'label' => $label,
                'status' => 'missing',
                'detail' => 'No submission yet.',
                'reason' => null,
                'submission_id' => null,
                'review_url' => null,
                'can_approve' => false,
            ];
        }

        return [
            'label' => $label,
            'status' => $submission->status,
            'detail' => $submission->reviewed_at?->diffForHumans()
                ? 'Reviewed ' . $submission->reviewed_at->diffForHumans()
                : 'Submitted ' . ($submission->created_at?->diffForHumans() ?: 'recently'),
            'reason' => $submission->rejection_reason,
            'submission_id' => $submission->id,
            'review_url' => DocumentSubmissionResource::getUrl('view', ['record' => $submission]),
            'can_approve' => in_array($submission->status, ['pending', 'submitted', 'pending_review'], true),
        ];
    }
}
