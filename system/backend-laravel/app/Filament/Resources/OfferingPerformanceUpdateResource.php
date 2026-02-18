<?php

namespace App\Filament\Resources;

use App\Filament\Resources\OfferingPerformanceUpdateResource\Pages;
use App\Models\OfferingPerformanceUpdate;
use App\Services\AdminAuditService;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class OfferingPerformanceUpdateResource extends Resource
{
    protected static ?string $model = OfferingPerformanceUpdate::class;
    protected static ?string $navigationIcon = 'heroicon-o-chart-bar';
    protected static ?string $navigationGroup = null;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('offering_id')
                ->relationship('offering', 'title')
                ->searchable()
                ->required(),
            Forms\Components\DatePicker::make('as_of_date')->required(),
            Forms\Components\TextInput::make('roi_percent')->numeric(),
            Forms\Components\TextInput::make('nav_per_unit')->numeric(),
            Forms\Components\Textarea::make('notes'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('offering.title')->label('Offering')->searchable(),
                Tables\Columns\TextColumn::make('as_of_date')->date()->sortable(),
                Tables\Columns\TextColumn::make('roi_percent')->suffix('%')->toggleable(),
                Tables\Columns\TextColumn::make('nav_per_unit')->money('USD')->toggleable(),
            ])
            ->actions([
                Tables\Actions\EditAction::make()
                    ->after(function (OfferingPerformanceUpdate $record) {
                        app(AdminAuditService::class)->log('performance.offering.updated', $record, [
                            'offering_id' => $record->offering_id,
                        ]);
                    }),
            ])
            ->defaultSort('as_of_date', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListOfferingPerformanceUpdates::route('/'),
            'create' => Pages\CreateOfferingPerformanceUpdate::route('/create'),
            'edit' => Pages\EditOfferingPerformanceUpdate::route('/{record}/edit'),
        ];
    }

    public static function shouldRegisterNavigation(): bool
    {
        return false;
    }
}
