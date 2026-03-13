<?php

namespace App\Filament\Resources\InvestorProfileResource\RelationManagers;

use App\Filament\Resources\DocumentSubmissionResource;
use App\Models\DocumentSubmission;
use App\Services\DocumentSubmissionReviewService;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Auth;

class DocumentSubmissionsRelationManager extends RelationManager
{
    protected static string $relationship = 'documentSubmissions';

    protected static ?string $title = 'Document Status';

    public function form(Form $form): Form
    {
        return $form->schema([]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('documentType.name')
                    ->label('Document')
                    ->searchable(),
                Tables\Columns\TextColumn::make('status')->badge(),
                Tables\Columns\TextColumn::make('rejection_reason')
                    ->label('Rejection reason')
                    ->wrap()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('reviewer.name')
                    ->label('Reviewed by')
                    ->toggleable(),
                Tables\Columns\TextColumn::make('reviewed_at')
                    ->dateTime()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->label('Uploaded')
                    ->toggleable(),
            ])
            ->actions([
                Tables\Actions\Action::make('open')
                    ->label('Open')
                    ->icon('heroicon-o-arrow-top-right-on-square')
                    ->url(fn (DocumentSubmission $record) => DocumentSubmissionResource::getUrl('view', ['record' => $record]))
                    ->openUrlInNewTab(),
                Tables\Actions\Action::make('approve')
                    ->label('Approve')
                    ->color('success')
                    ->requiresConfirmation()
                    ->visible(fn (DocumentSubmission $record) => $record->status !== 'approved')
                    ->action(function (DocumentSubmission $record): void {
                        app(DocumentSubmissionReviewService::class)->approve($record, Auth::id());

                        Notification::make()
                            ->title('Document approved')
                            ->success()
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
                    ->visible(fn (DocumentSubmission $record) => $record->status !== 'rejected')
                    ->action(function (DocumentSubmission $record, array $data): void {
                        app(DocumentSubmissionReviewService::class)->reject($record, Auth::id(), $data['reason']);

                        Notification::make()
                            ->title('Document rejected')
                            ->danger()
                            ->send();
                    }),
            ])
            ->defaultSort('created_at', 'desc');
    }
}
