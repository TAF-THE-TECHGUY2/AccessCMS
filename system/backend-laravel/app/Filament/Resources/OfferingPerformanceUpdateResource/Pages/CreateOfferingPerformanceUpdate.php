<?php

namespace App\Filament\Resources\OfferingPerformanceUpdateResource\Pages;

use App\Filament\Resources\OfferingPerformanceUpdateResource;
use App\Services\AdminAuditService;
use Filament\Resources\Pages\CreateRecord;

class CreateOfferingPerformanceUpdate extends CreateRecord
{
    protected static string $resource = OfferingPerformanceUpdateResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['created_by'] = auth()->id();
        return $data;
    }

    protected function afterCreate(): void
    {
        app(AdminAuditService::class)->log('performance.offering.created', $this->record, [
            'offering_id' => $this->record->offering_id,
        ]);
    }
}
