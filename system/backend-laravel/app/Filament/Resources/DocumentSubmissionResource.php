<?php

namespace App\Filament\Resources;

use App\Filament\Resources\DocumentSubmissionResource\Pages;
use App\Models\DocumentSubmission;
use App\Services\DocumentSubmissionReviewService;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class DocumentSubmissionResource extends Resource
{
    protected static ?string $model = DocumentSubmission::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-check';

    protected static ?string $navigationGroup = 'Investors';

    protected static ?string $navigationLabel = 'Document Submissions';

    public static function canCreate(): bool
    {
        return false;
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('user_id')
                ->relationship('user', 'email')
                ->searchable()
                ->disabled(),
            Forms\Components\Select::make('document_type_id')
                ->relationship('documentType', 'name')
                ->disabled(),
            Forms\Components\Select::make('external_purchase_id')
                ->relationship('externalPurchase', 'reference')
                ->searchable()
                ->disabled(),
            Forms\Components\TextInput::make('file_path')->disabled(),
            Forms\Components\TextInput::make('disk')->disabled(),
            Forms\Components\TextInput::make('version')->disabled(),
            Forms\Components\Select::make('status')
                ->options([
                    'pending' => 'Pending',
                    'approved' => 'Approved',
                    'rejected' => 'Rejected',
                ])
                ->disabled(),
            Forms\Components\Textarea::make('rejection_reason')
                ->rows(3)
                ->disabled(),
            Forms\Components\TextInput::make('reviewer.name')
                ->label('Reviewed By')
                ->disabled(),
            Forms\Components\DateTimePicker::make('reviewed_at')->disabled(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable()->toggleable(),
                Tables\Columns\TextColumn::make('user.email')
                    ->label('Investor')
                    ->searchable(),
                Tables\Columns\TextColumn::make('documentType.name')
                    ->label('Document')
                    ->searchable(),
                Tables\Columns\TextColumn::make('documentType.code')
                    ->label('Code')
                    ->badge()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('externalPurchase.reference')
                    ->label('Purchase Ref')
                    ->placeholder('—')
                    ->toggleable(),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->sortable(),
                Tables\Columns\TextColumn::make('reviewer.name')
                    ->label('Reviewed By')
                    ->toggleable(),
                Tables\Columns\TextColumn::make('reviewed_at')
                    ->dateTime()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->toggleable(),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'approved' => 'Approved',
                        'rejected' => 'Rejected',
                    ]),
                SelectFilter::make('document_type_id')
                    ->relationship('documentType', 'name')
                    ->label('Document type'),
            ])
            ->actions([
                Tables\Actions\Action::make('open')
                    ->label('Open')
                    ->icon('heroicon-o-arrow-top-right-on-square')
                    ->url(fn (DocumentSubmission $record) => static::fileUrl($record))
                    ->openUrlInNewTab(),
                Tables\Actions\Action::make('download')
                    ->label('Download')
                    ->icon('heroicon-o-arrow-down-tray')
                    ->url(fn (DocumentSubmission $record) => static::fileUrl($record))
                    ->openUrlInNewTab()
                    ->extraAttributes(['download' => '']),
                Tables\Actions\Action::make('approve')
                    ->label('Approve')
                    ->color('success')
                    ->icon('heroicon-o-check-circle')
                    ->visible(fn (DocumentSubmission $record) => $record->status !== 'approved')
                    ->requiresConfirmation()
                    ->action(function (DocumentSubmission $record): void {
                        app(DocumentSubmissionReviewService::class)->approve($record, Auth::id());

                        Notification::make()
                            ->title('Submission approved')
                            ->success()
                            ->send();
                    }),
                Tables\Actions\Action::make('reject')
                    ->label('Reject')
                    ->color('danger')
                    ->icon('heroicon-o-x-circle')
                    ->visible(fn (DocumentSubmission $record) => $record->status !== 'rejected')
                    ->form([
                        Forms\Components\Textarea::make('reason')
                            ->required()
                            ->maxLength(1000),
                    ])
                    ->action(function (DocumentSubmission $record, array $data): void {
                        app(DocumentSubmissionReviewService::class)->reject($record, Auth::id(), $data['reason']);

                        Notification::make()
                            ->title('Submission rejected')
                            ->danger()
                            ->send();
                    }),
                Tables\Actions\ViewAction::make(),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListDocumentSubmissions::route('/'),
            'view' => Pages\ViewDocumentSubmission::route('/{record}'),
        ];
    }

    private static function fileUrl(DocumentSubmission $record): ?string
    {
        if (! $record->file_path) {
            return null;
        }

        $disk = $record->disk ?: config('filesystems.default', 'public');
        $storage = Storage::disk($disk);

        return method_exists($storage, 'temporaryUrl')
            ? $storage->temporaryUrl($record->file_path, now()->addMinutes(30))
            : $storage->url($record->file_path);
    }
}
