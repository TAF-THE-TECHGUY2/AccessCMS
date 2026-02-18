<?php

namespace App\Filament\Resources\InvestorProfileResource\Pages;

use App\Filament\Resources\InvestorProfileResource;
use App\Models\InvestorProfile;
use Filament\Resources\Pages\ListRecords;
use Filament\Resources\Components\Tab;

class ListInvestorProfiles extends ListRecords
{
    protected static string $resource = InvestorProfileResource::class;

    public function getTabs(): array
    {
        return [
            'all' => Tab::make(),
            'pending' => Tab::make('Pending Review')
                ->modifyQueryUsing(fn ($query) => $query->whereIn('status', [
                    InvestorProfile::STATUS_PENDING_REVIEW,
                    InvestorProfile::STATUS_NEEDS_MORE_DOCS,
                ])),
            'partner' => Tab::make('Needs Partner Proof')
                ->modifyQueryUsing(fn ($query) => $query->where('status', InvestorProfile::STATUS_NEEDS_PARTNER_PROOF)),
            'approved' => Tab::make('Approved')
                ->modifyQueryUsing(fn ($query) => $query->where('status', InvestorProfile::STATUS_APPROVED)),
        ];
    }
}
