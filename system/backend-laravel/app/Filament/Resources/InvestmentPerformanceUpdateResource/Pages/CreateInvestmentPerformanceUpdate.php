<?php

namespace App\Filament\Resources\InvestmentPerformanceUpdateResource\Pages;

use App\Filament\Resources\InvestmentPerformanceUpdateResource;
use App\Services\AdminAuditService;
use Filament\Resources\Pages\CreateRecord;

class CreateInvestmentPerformanceUpdate extends CreateRecord
{
    protected static string $resource = InvestmentPerformanceUpdateResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['created_by'] = auth()->id();
        return $data;
    }

    protected function afterCreate(): void
    {
        app(AdminAuditService::class)->log('performance.investment.created', $this->record, [
            'investment_id' => $this->record->investment_id,
        ]);
    }
}
