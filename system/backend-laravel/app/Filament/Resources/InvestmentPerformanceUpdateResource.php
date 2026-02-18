<?php

namespace App\Filament\Resources;

use App\Filament\Resources\InvestmentPerformanceUpdateResource\Pages;
use App\Models\InvestmentPerformanceUpdate;
use App\Services\AdminAuditService;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class InvestmentPerformanceUpdateResource extends Resource
{
    protected static ?string $model = InvestmentPerformanceUpdate::class;
    protected static ?string $navigationIcon = 'heroicon-o-chart-bar';
    protected static ?string $navigationGroup = null;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('investment_id')
                ->relationship('investment', 'id')
                ->searchable()
                ->required(),
            Forms\Components\DatePicker::make('as_of_date')->required(),
            Forms\Components\TextInput::make('roi_percent')->numeric(),
            Forms\Components\TextInput::make('current_value')->numeric(),
            Forms\Components\Textarea::make('notes'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('investment.id')->label('Investment'),
                Tables\Columns\TextColumn::make('as_of_date')->date()->sortable(),
                Tables\Columns\TextColumn::make('roi_percent')->suffix('%')->toggleable(),
                Tables\Columns\TextColumn::make('current_value')->money('USD')->toggleable(),
            ])
            ->actions([
                Tables\Actions\EditAction::make()
                    ->after(function (InvestmentPerformanceUpdate $record) {
                        app(AdminAuditService::class)->log('performance.investment.updated', $record, [
                            'investment_id' => $record->investment_id,
                        ]);
                    }),
            ])
            ->defaultSort('as_of_date', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListInvestmentPerformanceUpdates::route('/'),
            'create' => Pages\CreateInvestmentPerformanceUpdate::route('/create'),
            'edit' => Pages\EditInvestmentPerformanceUpdate::route('/{record}/edit'),
        ];
    }

    public static function shouldRegisterNavigation(): bool
    {
        return false;
    }
}
