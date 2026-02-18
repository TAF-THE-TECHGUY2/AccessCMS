<?php

namespace App\Filament\Resources\FundingInstructionResource\Pages;

use App\Filament\Resources\FundingInstructionResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListFundingInstructions extends ListRecords
{
    protected static string $resource = FundingInstructionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
