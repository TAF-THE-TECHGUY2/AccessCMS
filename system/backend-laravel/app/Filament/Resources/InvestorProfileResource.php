<?php

namespace App\Filament\Resources;

use App\Filament\Resources\InvestorProfileResource\Pages;
use App\Filament\Resources\InvestorProfileResource\RelationManagers\DocumentsRelationManager;
use App\Filament\Resources\InvestorProfileResource\RelationManagers\InvestmentsRelationManager;
use App\Filament\Resources\InvestorProfileResource\RelationManagers\PaymentsRelationManager;
use App\Filament\Resources\InvestorProfileResource\RelationManagers\WorkflowEventsRelationManager;
use App\Models\InvestorProfile;
use App\Models\WorkflowEvent;
use App\Services\AdminAuditService;
use Filament\Forms;
use Filament\Forms\Form;
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
                    ->label('Approve')
                    ->color('success')
                    ->requiresConfirmation()
                    ->action(function (InvestorProfile $record): void {
                        $fromStatus = $record->status;

                        if (! $record->canApproveCrowdfunder()) {
                            $record->update([
                                'status' => InvestorProfile::STATUS_NEEDS_PARTNER_PROOF,
                            ]);

                        WorkflowEvent::create([
                            'investor_profile_id' => $record->id,
                            'from_status' => $fromStatus,
                            'to_status' => InvestorProfile::STATUS_NEEDS_PARTNER_PROOF,
                            'by_admin_user_id' => Auth::id(),
                            'notes' => 'Crowdfunder requires approved partner proof before approval.',
                        ]);

                        app(AdminAuditService::class)->log('investor.needs_partner_proof', $record, [
                            'from_status' => $fromStatus,
                        ]);

                            Notification::make()
                                ->title('Partner proof required')
                                ->warning()
                                ->body('Approve the partner proof document first.')
                                ->send();

                            return;
                        }

                        $record->update([
                            'status' => InvestorProfile::STATUS_APPROVED,
                            'approved_at' => now(),
                            'rejected_at' => null,
                        ]);

                        WorkflowEvent::create([
                            'investor_profile_id' => $record->id,
                            'from_status' => $fromStatus,
                            'to_status' => InvestorProfile::STATUS_APPROVED,
                            'by_admin_user_id' => Auth::id(),
                            'notes' => 'Investor approved.',
                        ]);

                        app(AdminAuditService::class)->log('investor.approved', $record, [
                            'from_status' => $fromStatus,
                        ]);
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
                    }),
            ])
            ->defaultSort('submitted_at', 'desc');
    }

    public static function getRelations(): array
    {
        return [
            DocumentsRelationManager::class,
            InvestmentsRelationManager::class,
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
}
