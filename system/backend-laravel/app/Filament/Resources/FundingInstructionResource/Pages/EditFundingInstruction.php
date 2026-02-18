<?php

namespace App\Filament\Resources\FundingInstructionResource\Pages;

use App\Filament\Resources\FundingInstructionResource;
use App\Models\FundingInstruction;
use Filament\Resources\Pages\EditRecord;

class EditFundingInstruction extends EditRecord
{
    protected static string $resource = FundingInstructionResource::class;

    protected function afterSave(): void
    {
        if ($this->record->is_active) {
            FundingInstruction::where('id', '!=', $this->record->id)->update(['is_active' => false]);
        }
    }
}
