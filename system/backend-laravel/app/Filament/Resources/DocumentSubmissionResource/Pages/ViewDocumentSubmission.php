<?php

namespace App\Filament\Resources\DocumentSubmissionResource\Pages;

use App\Filament\Resources\DocumentSubmissionResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewDocumentSubmission extends ViewRecord
{
    protected static string $resource = DocumentSubmissionResource::class;

    protected function getHeaderActions(): array
    {
        return [];
    }
}
