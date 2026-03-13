<?php

namespace App\Filament\Resources;

use App\Filament\Resources\InvestorProfileResource\RelationManagers\DocumentSubmissionsRelationManager;
use App\Filament\Resources\InvestorProfileResource\Pages;
use App\Filament\Resources\InvestorProfileResource\RelationManagers\InvestmentsRelationManager;
use App\Filament\Resources\InvestorProfileResource\RelationManagers\PaymentsRelationManager;
use App\Filament\Resources\InvestorProfileResource\RelationManagers\PortfolioAllocationsRelationManager;
use App\Filament\Resources\InvestorProfileResource\RelationManagers\WorkflowEventsRelationManager;
use App\Models\DocumentSubmission;
use App\Models\InvestorProfile;
use App\Models\WorkflowEvent;
use App\Services\AdminAuditService;
use App\Services\InvestorKycApprovalService;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Infolists\Components\Grid;
use Filament\Infolists\Components\Section as InfolistSection;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Auth;

class InvestorProfileResource extends Resource
{
    protected static ?string $model = InvestorProfile::class;

    protected static ?string $navigationIcon = 'heroicon-o-user';

    protected static ?string $navigationGroup = 'Investors';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Investor')
                    ->columns(2)
                    ->schema([
                        Forms\Components\Select::make('investor_type')
                            ->options([
                                InvestorProfile::INVESTOR_TYPE_ACCREDITED => 'Accredited',
                                InvestorProfile::INVESTOR_TYPE_CROWDFUNDER => 'Crowdfunder',
                            ])
                            ->required(),
                        Forms\Components\TextInput::make('profile_type')->maxLength(255),
                        Forms\Components\TextInput::make('full_name')->required()->maxLength(255),
                        Forms\Components\TextInput::make('title')->maxLength(255),
                        Forms\Components\TextInput::make('email')->email()->required(),
                        Forms\Components\TextInput::make('phone')->required(),
                    ]),
                Forms\Components\Section::make('Address')
                    ->columns(2)
                    ->schema([
                        Forms\Components\TextInput::make('address_line1')->required(),
                        Forms\Components\TextInput::make('address_line2'),
                        Forms\Components\TextInput::make('city')->required(),
                        Forms\Components\TextInput::make('state')->required(),
                        Forms\Components\TextInput::make('postal_code')->required(),
                        Forms\Components\TextInput::make('country')->required(),
                    ]),
                Forms\Components\Section::make('Status')
                    ->columns(3)
                    ->schema([
                        Forms\Components\Select::make('status')
                            ->options([
                                InvestorProfile::STATUS_PENDING_REVIEW => 'Pending Review',
                                InvestorProfile::STATUS_NEEDS_MORE_DOCS => 'Needs More Docs',
                                InvestorProfile::STATUS_NEEDS_PARTNER_PROOF => 'Needs Partner Proof',
                                InvestorProfile::STATUS_APPROVED => 'Approved',
                                InvestorProfile::STATUS_REJECTED => 'Rejected',
                            ])
                            ->required(),
                        Forms\Components\Select::make('track_status')
                            ->options([
                                InvestorProfile::TRACK_STATUS_ACCREDITED_APPROVED => 'Accredited Approved',
                                InvestorProfile::TRACK_STATUS_CROWDFUNDER_ACTIVE => 'Crowdfunder Active',
                            ]),
                        Forms\Components\Select::make('partner_status')
                            ->options([
                                'not_required' => 'Not Required',
                                'pending' => 'Pending',
                                'approved' => 'Approved',
                                'rejected' => 'Rejected',
                            ])
                            ->required(),
                        Forms\Components\TextInput::make('partner_profile_url')->url(),
                    ]),
                Forms\Components\Section::make('Timestamps')
                    ->columns(3)
                    ->schema([
                        Forms\Components\DateTimePicker::make('submitted_at'),
                        Forms\Components\DateTimePicker::make('approved_at'),
                        Forms\Components\DateTimePicker::make('rejected_at'),
                    ]),
            ]);
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                InfolistSection::make('Investor Summary')
                    ->schema([
                        Grid::make(4)
                            ->schema([
                                TextEntry::make('full_name')
                                    ->label('Full name')
                                    ->weight('bold'),
                                TextEntry::make('investor_type')
                                    ->label('Pathway')
                                    ->badge(),
                                TextEntry::make('status')
                                    ->badge(),
                                TextEntry::make('track_status')
                                    ->label('Track status')
                                    ->badge()
                                    ->placeholder('—'),
                            ]),
                        Grid::make(3)
                            ->schema([
                                TextEntry::make('email'),
                                TextEntry::make('phone'),
                                TextEntry::make('country')->placeholder('—'),
                            ]),
                    ]),
                InfolistSection::make('Address')
                    ->schema([
                        Grid::make(3)
                            ->schema([
                                TextEntry::make('address_line1')->label('Address line 1')->placeholder('—'),
                                TextEntry::make('address_line2')->label('Address line 2')->placeholder('—'),
                                TextEntry::make('city')->placeholder('—'),
                                TextEntry::make('state')->placeholder('—'),
                                TextEntry::make('postal_code')->label('Postal code')->placeholder('—'),
                                TextEntry::make('country')->placeholder('—'),
                            ]),
                    ]),
                InfolistSection::make('Document Status')
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                TextEntry::make('identity_document_status')
                                    ->label('Identity document')
                                    ->state(function (InvestorProfile $record): string {
                                        return static::documentStatusFor($record, ['government_id']);
                                    })
                                    ->badge(),
                                TextEntry::make('partner_proof_status')
                                    ->label('Partner proof')
                                    ->state(function (InvestorProfile $record): string {
                                        if (! $record->partner_required) {
                                            return 'not_required';
                                        }

                                        return static::documentStatusFor($record, ['partner_profile_screenshot']);
                                    })
                                    ->badge(),
                                TextEntry::make('accreditation_status')
                                    ->label('Accreditation')
                                    ->state(function (InvestorProfile $record): string {
                                        if ($record->investor_type !== InvestorProfile::INVESTOR_TYPE_ACCREDITED) {
                                            return 'not_required';
                                        }

                                        return static::documentStatusFor($record, ['accreditation_evidence']);
                                    })
                                    ->badge(),
                                TextEntry::make('shares_confirmation_status')
                                    ->label('Shares confirmation')
                                    ->state(function (InvestorProfile $record): string {
                                        if ($record->investor_type !== InvestorProfile::INVESTOR_TYPE_CROWDFUNDER) {
                                            return 'not_required';
                                        }

                                        return static::documentStatusFor($record, ['shares_confirmation']);
                                    })
                                    ->badge(),
                            ]),
                        TextEntry::make('document_rejections')
                            ->label('Latest document issues')
                            ->state(function (InvestorProfile $record): string {
                                $issues = $record->documentSubmissions()
                                    ->with('documentType')
                                    ->where('status', 'rejected')
                                    ->latest('reviewed_at')
                                    ->limit(3)
                                    ->get()
                                    ->map(function (DocumentSubmission $submission): string {
                                        $label = $submission->documentType?->name ?: 'Document';
                                        $reason = $submission->rejection_reason ?: 'Rejected';

                                        return "{$label}: {$reason}";
                                    });

                                return $issues->isNotEmpty() ? $issues->implode("\n") : 'No document issues.';
                            })
                            ->columnSpanFull()
                            ->placeholder('No document issues.')
                            ->prose(),
                    ]),
                InfolistSection::make('Holdings Summary')
                    ->schema([
                        Grid::make(4)
                            ->schema([
                                TextEntry::make('direct_investment_count')
                                    ->label('Direct investments')
                                    ->state(fn (InvestorProfile $record): int => $record->investments()->count()),
                                TextEntry::make('crowdfunder_holding_count')
                                    ->label('Crowdfunder holdings')
                                    ->state(fn (InvestorProfile $record): int => $record->portfolioAllocations()->count()),
                                TextEntry::make('direct_investment_total')
                                    ->label('Direct committed')
                                    ->state(fn (InvestorProfile $record): float => (float) $record->investments()->sum('amount'))
                                    ->money('USD'),
                                TextEntry::make('crowdfunder_total')
                                    ->label('Crowdfunder committed')
                                    ->state(fn (InvestorProfile $record): float => (float) $record->portfolioAllocations()->sum('amount'))
                                    ->money('USD'),
                            ]),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable()->toggleable(),
                Tables\Columns\TextColumn::make('full_name')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('email')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('phone')->searchable(),
                Tables\Columns\TextColumn::make('investor_type')->badge()->sortable(),
                Tables\Columns\TextColumn::make('status')->badge()->sortable(),
                Tables\Columns\TextColumn::make('track_status')->badge()->toggleable(),
                Tables\Columns\TextColumn::make('partner_status')->badge()->toggleable(),
                Tables\Columns\TextColumn::make('submitted_at')->dateTime()->sortable()->toggleable(),
                Tables\Columns\TextColumn::make('approved_at')->dateTime()->sortable()->toggleable(),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->options([
                        InvestorProfile::STATUS_PENDING_REVIEW => 'Pending Review',
                        InvestorProfile::STATUS_NEEDS_MORE_DOCS => 'Needs More Docs',
                        InvestorProfile::STATUS_NEEDS_PARTNER_PROOF => 'Needs Partner Proof',
                        InvestorProfile::STATUS_APPROVED => 'Approved',
                        InvestorProfile::STATUS_REJECTED => 'Rejected',
                    ]),
                SelectFilter::make('investor_type')
                    ->options([
                        InvestorProfile::INVESTOR_TYPE_ACCREDITED => 'Accredited',
                        InvestorProfile::INVESTOR_TYPE_CROWDFUNDER => 'Crowdfunder',
                    ]),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('approve')
                    ->label('Approve KYC')
                    ->color('success')
                    ->requiresConfirmation()
                    ->action(function (InvestorProfile $record): void {
                        $result = app(InvestorKycApprovalService::class)->approve($record, Auth::id());

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
                Tables\Actions\Action::make('reject')
                    ->label('Reject')
                    ->color('danger')
                    ->form([
                        Forms\Components\Textarea::make('reason')
                            ->label('Rejection reason')
                            ->required(),
                    ])
                    ->action(function (InvestorProfile $record, array $data): void {
                        $fromStatus = $record->status;

                        $record->update([
                            'status' => InvestorProfile::STATUS_REJECTED,
                            'track_status' => null,
                            'rejected_at' => now(),
                            'approved_at' => null,
                        ]);

                        WorkflowEvent::create([
                            'investor_profile_id' => $record->id,
                            'from_status' => $fromStatus,
                            'to_status' => InvestorProfile::STATUS_REJECTED,
                            'by_admin_user_id' => Auth::id(),
                            'notes' => $data['reason'],
                        ]);

                        app(AdminAuditService::class)->log('investor.rejected', $record, [
                            'from_status' => $fromStatus,
                            'reason' => $data['reason'],
                        ]);

                        Notification::make()
                            ->title('KYC rejected')
                            ->danger()
                            ->send();
                    }),
                Tables\Actions\Action::make('request_more_docs')
                    ->label('Request More Docs')
                    ->color('warning')
                    ->form([
                        Forms\Components\Textarea::make('notes')->label('Notes')->required(),
                    ])
                    ->action(function (InvestorProfile $record, array $data): void {
                        $fromStatus = $record->status;

                        $record->update([
                            'status' => InvestorProfile::STATUS_NEEDS_MORE_DOCS,
                            'track_status' => null,
                        ]);

                        WorkflowEvent::create([
                            'investor_profile_id' => $record->id,
                            'from_status' => $fromStatus,
                            'to_status' => InvestorProfile::STATUS_NEEDS_MORE_DOCS,
                            'by_admin_user_id' => Auth::id(),
                            'notes' => $data['notes'],
                        ]);

                        app(AdminAuditService::class)->log('investor.needs_more_docs', $record, [
                            'from_status' => $fromStatus,
                            'notes' => $data['notes'],
                        ]);

                        Notification::make()
                            ->title('Requested more documents')
                            ->warning()
                            ->send();
                    }),
            ])
            ->defaultSort('submitted_at', 'desc');
    }

    public static function getRelations(): array
    {
        return [
            DocumentSubmissionsRelationManager::class,
            InvestmentsRelationManager::class,
            PortfolioAllocationsRelationManager::class,
            PaymentsRelationManager::class,
            WorkflowEventsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListInvestorProfiles::route('/'),
            'view' => Pages\ViewInvestorProfile::route('/{record}'),
            'edit' => Pages\EditInvestorProfile::route('/{record}/edit'),
        ];
    }

    protected static function documentStatusFor(InvestorProfile $record, array $codes): string
    {
        $submission = $record->documentSubmissions()
            ->whereHas('documentType', function ($query) use ($codes) {
                $query->whereIn('code', $codes);
            })
            ->latest('created_at')
            ->first();

        return $submission?->status ?? 'missing';
    }
}
