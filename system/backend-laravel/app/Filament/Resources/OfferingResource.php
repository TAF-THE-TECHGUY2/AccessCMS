<?php

namespace App\Filament\Resources;

use App\Filament\Resources\OfferingResource\Pages;
use App\Filament\Resources\OfferingResource\RelationManagers\PerformanceUpdatesRelationManager;
use App\Models\Offering;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class OfferingResource extends Resource
{
    protected static ?string $model = Offering::class;
    protected static ?string $navigationIcon = 'heroicon-o-briefcase';
    protected static ?string $navigationGroup = 'Investments';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('title')->required()->maxLength(255),
            Forms\Components\TextInput::make('slug')->required()->maxLength(255),
            Forms\Components\Textarea::make('summary')->rows(3),
            Forms\Components\TextInput::make('target_amount')->numeric(),
            Forms\Components\TextInput::make('min_investment')->numeric()->required(),
            Forms\Components\TextInput::make('max_investment')->numeric()->required(),
            Forms\Components\Select::make('status')
                ->options([
                    'draft' => 'Draft',
                    'open' => 'Open',
                    'closed' => 'Closed',
                ])
                ->required(),
            Forms\Components\DatePicker::make('opened_at'),
            Forms\Components\DatePicker::make('closed_at'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('status')->badge()->sortable(),
                Tables\Columns\TextColumn::make('target_amount')->money('USD')->toggleable(),
                Tables\Columns\TextColumn::make('min_investment')->money('USD'),
                Tables\Columns\TextColumn::make('max_investment')->money('USD')->toggleable(),
                Tables\Columns\TextColumn::make('opened_at')->date()->toggleable(),
                Tables\Columns\TextColumn::make('closed_at')->date()->toggleable(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListOfferings::route('/'),
            'create' => Pages\CreateOffering::route('/create'),
            'edit' => Pages\EditOffering::route('/{record}/edit'),
        ];
    }

    public static function getRelations(): array
    {
        return [
            PerformanceUpdatesRelationManager::class,
        ];
    }
}
