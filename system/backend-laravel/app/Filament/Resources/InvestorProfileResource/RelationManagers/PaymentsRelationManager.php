<?php

namespace App\Filament\Resources\InvestorProfileResource\RelationManagers;

use App\Models\Payment;
use App\Models\WorkflowEvent;
use App\Services\AdminAuditService;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Auth;

class PaymentsRelationManager extends RelationManager
{
    protected static string $relationship = 'payments';

    public function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('amount')->numeric()->required(),
            Forms\Components\Select::make('status')
                ->options([
                    'pending' => 'Pending',
                    'approved' => 'Approved',
                    'rejected' => 'Rejected',
                ])
                ->required(),
        ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('investment.id')->label('Investment'),
                Tables\Columns\TextColumn::make('amount')->money('USD'),
                Tables\Columns\TextColumn::make('status')->badge(),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->toggleable(),
            ])
            ->actions([
                Tables\Actions\Action::make('approve')
                    ->label('Approve')
                    ->color('success')
                    ->requiresConfirmation()
                    ->action(function (Payment $record): void {
                        $record->update(['status' => 'approved']);

                        if ($record->investment) {
                            $record->investment->update([
                                'status' => 'funded',
                                'funded_at' => now(),
                                'approved_at' => now(),
                                'rejected_at' => null,
                            ]);

                            WorkflowEvent::create([
                                'investor_profile_id' => $record->investment->investor_profile_id,
                                'from_status' => null,
                                'to_status' => 'payment_approved',
                                'by_admin_user_id' => Auth::id(),
                                'notes' => "Payment approved (#{$record->id}).",
                            ]);
                        }

                        app(AdminAuditService::class)->log('payment.approved', $record, [
                            'payment_id' => $record->id,
                        ]);
                    }),
                Tables\Actions\Action::make('reject')
                    ->label('Reject')
                    ->color('danger')
                    ->form([
                        Forms\Components\Textarea::make('reason')->required(),
                    ])
                    ->action(function (Payment $record, array $data): void {
                        $record->update(['status' => 'rejected']);

                        if ($record->investment) {
                            WorkflowEvent::create([
                                'investor_profile_id' => $record->investment->investor_profile_id,
                                'from_status' => null,
                                'to_status' => 'payment_rejected',
                                'by_admin_user_id' => Auth::id(),
                                'notes' => "Payment rejected (#{$record->id}). {$data['reason']}",
                            ]);
                        }

                        app(AdminAuditService::class)->log('payment.rejected', $record, [
                            'payment_id' => $record->id,
                            'reason' => $data['reason'],
                        ]);
                    }),
            ])
            ->defaultSort('created_at', 'desc');
    }
}
