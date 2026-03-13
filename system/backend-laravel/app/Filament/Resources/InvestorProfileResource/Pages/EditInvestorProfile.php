<?php

namespace App\Filament\Resources\InvestorProfileResource\Pages;

use App\Filament\Resources\InvestorProfileResource;
use App\Services\InvestorKycApprovalService;
use Filament\Actions;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Support\Facades\Auth;

class EditInvestorProfile extends EditRecord
{
    protected static string $resource = InvestorProfileResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('approveKyc')
                ->label('Approve KYC')
                ->color('success')
                ->requiresConfirmation()
                ->action(function (): void {
                    $result = app(InvestorKycApprovalService::class)->approve($this->record, Auth::id());

                    if (! $result['approved']) {
                        Notification::make()
                            ->title('Investor cannot be approved yet')
                            ->warning()
                            ->body(implode(' ', $result['blockers']))
                            ->send();

                        return;
                    }

                    Notification::make()
                        ->title('KYC approved')
                        ->success()
                        ->body("Status set to Approved and track status set to {$result['track_status']}.")
                        ->send();
                }),
            Actions\ViewAction::make(),
        ];
    }
}
