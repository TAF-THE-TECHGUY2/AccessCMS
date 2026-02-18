<?php

namespace App\Filament\Resources;

use App\Filament\Resources\OnboardingDocumentResource\Pages;
use App\Models\OnboardingDocument;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Forms;
use Illuminate\Support\Facades\Storage;

class OnboardingDocumentResource extends Resource
{
    protected static ?string $model = OnboardingDocument::class;
    protected static ?string $navigationIcon = 'heroicon-o-document-text';
    protected static ?string $navigationLabel = 'Onboarding Documents';

    public static function form(Forms\Form $form): Forms\Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('type')->disabled(),
            Forms\Components\TextInput::make('file_path')->disabled(),
        ]);
    }

    public static function table(Tables\Table $table): Tables\Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('onboarding.user.name')->label('Investor'),
                Tables\Columns\TextColumn::make('type')->badge(),
                Tables\Columns\TextColumn::make('created_at')->dateTime(),
            ])
            ->actions([
                Tables\Actions\Action::make('download')
                    ->label('Download')
                    ->url(function (OnboardingDocument $record) {
                        $disk = $record->disk ?? config('filesystems.default', 'public');
                        return Storage::disk($disk)->url($record->file_path);
                    })
                    ->openUrlInNewTab(),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListOnboardingDocuments::route('/'),
            'edit' => Pages\EditOnboardingDocument::route('/{record}/edit'),
        ];
    }
}
