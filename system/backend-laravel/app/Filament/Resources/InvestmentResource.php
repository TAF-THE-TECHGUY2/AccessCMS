<?php

namespace App\Filament\Resources;

use App\Filament\Resources\InvestmentResource\Pages;
use App\Models\Investment;
use App\Models\WorkflowEvent;
use App\Services\AdminAuditService;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Auth;

class InvestmentResource extends Resource
{
    protected static ?string $model = Investment::class;
    protected static ?string $navigationIcon = 'heroicon-o-banknotes';
    protected static ?string $navigationGroup = 'Investments';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('investor_profile_id')
                ->relationship('investorProfile', 'full_name')
                ->searchable()
                ->required(),
            Forms\Components\Select::make('offering_id')
                ->relationship('offering', 'title')
                ->searchable()
                ->required(),
            Forms\Components\TextInput::make('amount')->numeric()->required(),
            Forms\Components\Select::make('status')
                ->options([
                    'pending' => 'Pending',
                    'funded' => 'Funded',
                    'active' => 'Active',
                    'rejected' => 'Rejected',
                ])
                ->required(),
            Forms\Components\DateTimePicker::make('funded_at'),
            Forms\Components\DateTimePicker::make('approved_at'),
            Forms\Components\DateTimePicker::make('rejected_at'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable()->toggleable(),
                Tables\Columns\TextColumn::make('investorProfile.full_name')->label('Investor')->searchable(),
                Tables\Columns\TextColumn::make('offering.title')->label('Offering')->searchable(),
                Tables\Columns\TextColumn::make('amount')->money('USD'),
                Tables\Columns\TextColumn::make('status')->badge(),
                Tables\Columns\TextColumn::make('funded_at')->dateTime()->toggleable(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('mark_funded')
                    ->label('Mark Funded')
                    ->color('success')
                    ->requiresConfirmation()
                    ->action(function (Investment $record): void {
                        $record->update([
                            'status' => 'funded',
                            'funded_at' => now(),
                            'approved_at' => now(),
                            'rejected_at' => null,
                        ]);

                        WorkflowEvent::create([
                            'investor_profile_id' => $record->investor_profile_id,
                            'from_status' => null,
                            'to_status' => 'funded',
                            'by_admin_user_id' => Auth::id(),
                            'notes' => "Investment funded (#{$record->id}).",
                        ]);

                        app(AdminAuditService::class)->log('investment.funded', $record, [
                            'investment_id' => $record->id,
                        ]);
                    }),
                Tables\Actions\Action::make('mark_active')
                    ->label('Mark Active')
                    ->color('primary')
                    ->requiresConfirmation()
                    ->action(function (Investment $record): void {
                        $record->update([
                            'status' => 'active',
                        ]);

                        WorkflowEvent::create([
                            'investor_profile_id' => $record->investor_profile_id,
                            'from_status' => null,
                            'to_status' => 'active',
                            'by_admin_user_id' => Auth::id(),
                            'notes' => "Investment active (#{$record->id}).",
                        ]);

                        app(AdminAuditService::class)->log('investment.active', $record, [
                            'investment_id' => $record->id,
                        ]);
                    }),
                Tables\Actions\Action::make('reject')
                    ->label('Reject')
                    ->color('danger')
                    ->form([
                        Forms\Components\Textarea::make('reason')->required(),
                    ])
                    ->action(function (Investment $record, array $data): void {
                        $record->update([
                            'status' => 'rejected',
                            'rejected_at' => now(),
                            'approved_at' => null,
                        ]);

                        WorkflowEvent::create([
                            'investor_profile_id' => $record->investor_profile_id,
                            'from_status' => null,
                            'to_status' => 'rejected',
                            'by_admin_user_id' => Auth::id(),
                            'notes' => "Investment rejected (#{$record->id}). {$data['reason']}",
                        ]);

                        app(AdminAuditService::class)->log('investment.rejected', $record, [
                            'investment_id' => $record->id,
                            'reason' => $data['reason'],
                        ]);
                    }),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListInvestments::route('/'),
            'create' => Pages\CreateInvestment::route('/create'),
            'edit' => Pages\EditInvestment::route('/{record}/edit'),
        ];
    }
}
