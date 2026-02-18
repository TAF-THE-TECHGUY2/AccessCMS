<?php

namespace App\Filament\Resources\OfferingResource\RelationManagers;

use App\Models\OfferingPerformanceUpdate;
use App\Services\AdminAuditService;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class PerformanceUpdatesRelationManager extends RelationManager
{
    protected static string $relationship = 'performanceUpdates';

    public function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\DatePicker::make('as_of_date')->required(),
            Forms\Components\TextInput::make('roi_percent')->numeric(),
            Forms\Components\TextInput::make('nav_per_unit')->numeric(),
            Forms\Components\Textarea::make('notes'),
        ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('as_of_date')->date()->sortable(),
                Tables\Columns\TextColumn::make('roi_percent')->suffix('%')->toggleable(),
                Tables\Columns\TextColumn::make('nav_per_unit')->money('USD')->toggleable(),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->toggleable(),
            ])
            ->actions([
                Tables\Actions\EditAction::make()
                    ->after(function (OfferingPerformanceUpdate $record) {
                        app(AdminAuditService::class)->log('performance.offering.updated', $record, [
                            'offering_id' => $record->offering_id,
                        ]);
                    }),
                Tables\Actions\DeleteAction::make(),
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make()
                    ->mutateFormDataUsing(function (array $data) {
                        $data['created_by'] = auth()->id();
                        return $data;
                    })
                    ->after(function (OfferingPerformanceUpdate $record) {
                        app(AdminAuditService::class)->log('performance.offering.created', $record, [
                            'offering_id' => $record->offering_id,
                        ]);
                    }),
            ])
            ->defaultSort('as_of_date', 'desc');
    }
}
