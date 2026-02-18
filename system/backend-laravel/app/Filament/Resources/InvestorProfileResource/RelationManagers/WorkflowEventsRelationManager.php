<?php

namespace App\Filament\Resources\InvestorProfileResource\RelationManagers;

use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class WorkflowEventsRelationManager extends RelationManager
{
    protected static string $relationship = 'workflowEvents';

    public function form(Form $form): Form
    {
        return $form;
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('from_status')->label('From'),
                Tables\Columns\TextColumn::make('to_status')->label('To'),
                Tables\Columns\TextColumn::make('admin.name')->label('By')->toggleable(),
                Tables\Columns\TextColumn::make('notes')->wrap(),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->headerActions([])
            ->actions([])
            ->bulkActions([]);
    }
}
