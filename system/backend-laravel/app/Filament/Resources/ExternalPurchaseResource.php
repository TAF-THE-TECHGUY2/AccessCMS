<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ExternalPurchaseResource\Pages;
use App\Models\ExternalPurchase;
use App\Services\AdminAuditService;
use App\Services\ExternalPurchaseService;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ExternalPurchaseResource extends Resource
{
    protected static ?string $model = ExternalPurchase::class;
    protected static ?string $navigationIcon = 'heroicon-o-arrow-top-right-on-square';
    protected static ?string $navigationGroup = 'Investments';
    protected static ?string $navigationLabel = 'External Purchases';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('user_id')
                ->relationship('user', 'email')
                ->searchable()
                ->required(),
            Forms\Components\Select::make('offering_id')
                ->relationship('offering', 'title')
                ->searchable()
                ->required(),
            Forms\Components\TextInput::make('provider')->required(),
            Forms\Components\TextInput::make('reference')->required(),
            Forms\Components\TextInput::make('redirect_url')->required(),
            Forms\Components\Select::make('status')
                ->options([
                    ExternalPurchase::STATUS_AWAITING_PROOF => 'Awaiting proof',
                    ExternalPurchase::STATUS_PENDING_REVIEW => 'Pending review',
                    ExternalPurchase::STATUS_APPROVED => 'Approved',
                    ExternalPurchase::STATUS_REJECTED => 'Rejected',
                ])
                ->required(),
            Forms\Components\TextInput::make('amount_expected')->numeric(),
            Forms\Components\TextInput::make('units_expected')->numeric(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('reference')->searchable(),
                Tables\Columns\TextColumn::make('user.email')->label('Investor')->searchable(),
                Tables\Columns\TextColumn::make('offering.title')->label('Offering')->searchable(),
                Tables\Columns\TextColumn::make('provider')->badge(),
                Tables\Columns\TextColumn::make('status')->badge(),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->toggleable(),
            ])
            ->actions([
                Tables\Actions\Action::make('view_proof')
                    ->label('View Proof')
                    ->icon('heroicon-o-arrow-top-right-on-square')
                    ->visible(fn (ExternalPurchase $record) => $record->proofSubmissions()->exists())
                    ->url(function (ExternalPurchase $record) {
                        $proof = $record->proofSubmissions()->latest()->first();
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
                Tables\Actions\Action::make('approve')
                    ->label('Approve')
                    ->color('success')
                    ->requiresConfirmation()
                    ->action(function (ExternalPurchase $record): void {
                        app(ExternalPurchaseService::class)->approve($record, Auth::id());

                        app(AdminAuditService::class)->log('external_purchase.approved', $record, [
                            'purchase_id' => $record->id,
                        ]);
                    }),
                Tables\Actions\Action::make('reject')
                    ->label('Reject')
                    ->color('danger')
                    ->form([
                        Forms\Components\Textarea::make('reason')->required(),
                    ])
                    ->action(function (ExternalPurchase $record, array $data): void {
                        app(ExternalPurchaseService::class)->reject($record, Auth::id(), $data['reason']);

                        app(AdminAuditService::class)->log('external_purchase.rejected', $record, [
                            'purchase_id' => $record->id,
                            'reason' => $data['reason'],
                        ]);
                    }),
                Tables\Actions\EditAction::make(),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListExternalPurchases::route('/'),
            'create' => Pages\CreateExternalPurchase::route('/create'),
            'edit' => Pages\EditExternalPurchase::route('/{record}/edit'),
        ];
    }
}
