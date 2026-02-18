<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PaymentResource\Pages;
use App\Models\Payment;
use App\Models\WorkflowEvent;
use App\Services\AdminAuditService;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class PaymentResource extends Resource
{
    protected static ?string $model = Payment::class;
    protected static ?string $navigationIcon = 'heroicon-o-credit-card';
    protected static ?string $navigationGroup = 'Investments';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('investment_id')
                ->relationship('investment', 'id')
                ->searchable()
                ->required(),
            Forms\Components\TextInput::make('amount')->numeric()->required(),
            Forms\Components\Select::make('status')
                ->options([
                    'pending' => 'Pending',
                    'approved' => 'Approved',
                    'rejected' => 'Rejected',
                ])
                ->required(),
            Forms\Components\TextInput::make('proof_document_id')->numeric(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable()->toggleable(),
                Tables\Columns\TextColumn::make('investment.id')->label('Investment'),
                Tables\Columns\TextColumn::make('amount')->money('USD'),
                Tables\Columns\TextColumn::make('status')->badge(),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->toggleable(),
            ])
            ->actions([
                Tables\Actions\Action::make('view_proof')
                    ->label('View Proof')
                    ->icon('heroicon-o-arrow-top-right-on-square')
                    ->visible(fn (Payment $record) => (bool) $record->proof_document_id)
                    ->url(function (Payment $record) {
                        $proof = $record->proofDocument;
                        if (! $proof) {
                            return null;
                        }
                        $disk = $proof->disk ?? config('filesystems.default', 'public');
                        $storage = Storage::disk($disk);
                        return method_exists($storage, 'temporaryUrl')
                            ? $storage->temporaryUrl($proof->file_path, now()->addMinutes(30))
                            : $storage->url($proof->file_path);
                    })
                    ->openUrlInNewTab(),
                Tables\Actions\EditAction::make(),
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

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPayments::route('/'),
            'create' => Pages\CreatePayment::route('/create'),
            'edit' => Pages\EditPayment::route('/{record}/edit'),
        ];
    }
}
