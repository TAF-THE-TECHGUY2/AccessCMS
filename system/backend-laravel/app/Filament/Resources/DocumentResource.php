<?php

namespace App\Filament\Resources;

use App\Filament\Resources\DocumentResource\Pages;
use App\Models\Document;
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

class DocumentResource extends Resource
{
    protected static ?string $model = Document::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-text';

    protected static ?string $navigationGroup = 'Investors';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('investor_profile_id')
                    ->relationship('investorProfile', 'full_name')
                    ->searchable()
                    ->required(),
                Forms\Components\TextInput::make('type')->required(),
                Forms\Components\TextInput::make('path')->required(),
                Forms\Components\TextInput::make('disk')->default('public')->required(),
                Forms\Components\Select::make('status')
                    ->options([
                        Document::STATUS_PENDING => 'Pending',
                        Document::STATUS_APPROVED => 'Approved',
                        Document::STATUS_REJECTED => 'Rejected',
                    ])
                    ->required(),
                Forms\Components\Textarea::make('rejection_reason'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable()->toggleable(),
                Tables\Columns\TextColumn::make('investorProfile.full_name')->label('Investor')->searchable(),
                Tables\Columns\TextColumn::make('type')->searchable(),
                Tables\Columns\TextColumn::make('status')->badge()->sortable(),
                Tables\Columns\TextColumn::make('reviewer.name')->label('Reviewed By')->toggleable(),
                Tables\Columns\TextColumn::make('reviewed_at')->dateTime()->toggleable(),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->options([
                        Document::STATUS_PENDING => 'Pending',
                        Document::STATUS_APPROVED => 'Approved',
                        Document::STATUS_REJECTED => 'Rejected',
                    ]),
            ])
            ->actions([
                Tables\Actions\Action::make('open')
                    ->label('Open')
                    ->icon('heroicon-o-arrow-top-right-on-square')
                    ->url(fn (Document $record) => $record->getSignedUrl())
                    ->openUrlInNewTab(),
                Tables\Actions\Action::make('download')
                    ->label('Download')
                    ->icon('heroicon-o-arrow-down-tray')
                    ->url(fn (Document $record) => $record->getSignedUrl())
                    ->openUrlInNewTab()
                    ->extraAttributes(['download' => '']),
                Tables\Actions\Action::make('approve')
                    ->label('Approve')
                    ->color('success')
                    ->requiresConfirmation()
                    ->action(function (Document $record): void {
                        $record->update([
                            'status' => Document::STATUS_APPROVED,
                            'reviewed_by' => Auth::id(),
                            'reviewed_at' => now(),
                            'rejection_reason' => null,
                        ]);

                        $profile = $record->investorProfile;
                        if ($record->type === Document::TYPE_PARTNER_PROFILE_SCREENSHOT) {
                            $profile->update(['partner_status' => 'approved']);
                        }

                        WorkflowEvent::create([
                            'investor_profile_id' => $profile->id,
                            'from_status' => $profile->status,
                            'to_status' => $profile->status,
                            'by_admin_user_id' => Auth::id(),
                            'notes' => "Document approved: {$record->type}",
                        ]);

                        app(AdminAuditService::class)->log('document.approved', $record, [
                            'type' => $record->type,
                            'investor_profile_id' => $profile->id,
                        ]);

                        Notification::make()
                            ->title('Document approved')
                            ->success()
                            ->send();
                    }),
                Tables\Actions\Action::make('reject')
                    ->label('Reject')
                    ->color('danger')
                    ->form([
                        Forms\Components\Textarea::make('reason')->required(),
                    ])
                    ->action(function (Document $record, array $data): void {
                        $record->update([
                            'status' => Document::STATUS_REJECTED,
                            'reviewed_by' => Auth::id(),
                            'reviewed_at' => now(),
                            'rejection_reason' => $data['reason'],
                        ]);

                        $profile = $record->investorProfile;
                        if ($record->type === Document::TYPE_PARTNER_PROFILE_SCREENSHOT) {
                            $profile->update(['partner_status' => 'rejected']);
                        }

                        WorkflowEvent::create([
                            'investor_profile_id' => $profile->id,
                            'from_status' => $profile->status,
                            'to_status' => $profile->status,
                            'by_admin_user_id' => Auth::id(),
                            'notes' => "Document rejected: {$record->type}. {$data['reason']}",
                        ]);

                        app(AdminAuditService::class)->log('document.rejected', $record, [
                            'type' => $record->type,
                            'reason' => $data['reason'],
                            'investor_profile_id' => $profile->id,
                        ]);
                    }),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListDocuments::route('/'),
            'view' => Pages\ViewDocument::route('/{record}'),
            'edit' => Pages\EditDocument::route('/{record}/edit'),
        ];
    }
}
