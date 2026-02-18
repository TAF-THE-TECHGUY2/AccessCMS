<?php

namespace App\Filament\Resources;

use App\Filament\Resources\InvestorOnboardingResource\Pages;
use App\Models\InvestorOnboarding;
use App\Notifications\OnboardingApproved;
use App\Notifications\OnboardingRejected;
use App\Services\AdminAuditService;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Actions\Action;

class InvestorOnboardingResource extends Resource
{
    protected static ?string $model = InvestorOnboarding::class;
    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-check';
    protected static ?string $navigationLabel = 'Investor Onboardings';

    public static function form(Forms\Form $form): Forms\Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('user.name')->label('Investor')->disabled(),
            Forms\Components\TextInput::make('pathway')->disabled(),
            Forms\Components\TextInput::make('review_status')->disabled(),
            Forms\Components\Textarea::make('rejection_reason')->disabled(),
        ]);
    }

    public static function table(Tables\Table $table): Tables\Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('user.name')->label('Investor')->searchable(),
                Tables\Columns\TextColumn::make('pathway')->label('Pathway')->badge(),
                Tables\Columns\TextColumn::make('review_status')->label('Status')->badge(),
                Tables\Columns\TextColumn::make('submitted_at')->dateTime()->label('Submitted'),
            ])
            ->filters([
                SelectFilter::make('review_status')->options([
                    'pending' => 'Pending',
                    'approved' => 'Approved',
                    'rejected' => 'Rejected',
                ]),
                SelectFilter::make('pathway')->options([
                    'accredited' => 'Accredited',
                    'crowdfunding' => 'Crowdfunding',
                ]),
            ])
            ->actions([
                Action::make('approve')
                    ->label('Approve')
                    ->color('success')
                    ->requiresConfirmation()
                    ->action(function (InvestorOnboarding $record) {
                        $record->update([
                            'review_status' => 'approved',
                            'approved_at' => now(),
                            'rejected_at' => null,
                            'rejection_reason' => null,
                        ]);
                        if ($record->user) {
                            $record->user->update(['status' => 'approved']);
                            $record->user->notify(new OnboardingApproved());
                        }

                        app(AdminAuditService::class)->log('onboarding.approved', $record, [
                            'user_id' => $record->user_id,
                        ]);
                    }),
                Action::make('reject')
                    ->label('Reject')
                    ->color('danger')
                    ->form([
                        Forms\Components\Textarea::make('reason')
                            ->label('Reason')
                            ->required(),
                    ])
                    ->action(function (InvestorOnboarding $record, array $data) {
                        $record->update([
                            'review_status' => 'rejected',
                            'rejected_at' => now(),
                            'approved_at' => null,
                            'rejection_reason' => $data['reason'],
                        ]);
                        if ($record->user) {
                            $record->user->update(['status' => 'rejected']);
                            $record->user->notify(new OnboardingRejected($data['reason']));
                        }

                        app(AdminAuditService::class)->log('onboarding.rejected', $record, [
                            'user_id' => $record->user_id,
                            'reason' => $data['reason'],
                        ]);
                    }),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListInvestorOnboardings::route('/'),
            'edit' => Pages\EditInvestorOnboarding::route('/{record}/edit'),
        ];
    }
}
