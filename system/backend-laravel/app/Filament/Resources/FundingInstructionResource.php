<?php

namespace App\Filament\Resources;

use App\Filament\Resources\FundingInstructionResource\Pages;
use App\Models\FundingInstruction;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class FundingInstructionResource extends Resource
{
    protected static ?string $model = FundingInstruction::class;
    protected static ?string $navigationIcon = 'heroicon-o-building-library';
    protected static ?string $navigationGroup = 'Investments';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('bank_name')->required()->maxLength(255),
            Forms\Components\TextInput::make('account_name')->required()->maxLength(255),
            Forms\Components\TextInput::make('routing_number')->maxLength(255),
            Forms\Components\TextInput::make('account_number')->required()->maxLength(255),
            Forms\Components\TextInput::make('reference_template')
                ->helperText('Use {id} for investor id, e.g. Investor {id}.')
                ->maxLength(255),
            Forms\Components\Toggle::make('is_active')->label('Active'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('bank_name')->searchable(),
                Tables\Columns\TextColumn::make('account_name')->searchable(),
                Tables\Columns\TextColumn::make('account_number')->toggleable(),
                Tables\Columns\IconColumn::make('is_active')->boolean()->label('Active'),
                Tables\Columns\TextColumn::make('updated_at')->dateTime()->toggleable(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->defaultSort('updated_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListFundingInstructions::route('/'),
            'create' => Pages\CreateFundingInstruction::route('/create'),
            'edit' => Pages\EditFundingInstruction::route('/{record}/edit'),
        ];
    }
}
