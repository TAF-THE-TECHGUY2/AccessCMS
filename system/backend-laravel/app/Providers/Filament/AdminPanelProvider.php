<?php

namespace App\Providers\Filament;

use Filament\Http\Middleware\Authenticate;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use App\Filament\Pages\Dashboard;
use App\Filament\Resources\AdminAuditLogResource;
use App\Filament\Resources\DocumentResource;
use App\Filament\Resources\FundingInstructionResource;
use App\Filament\Resources\InvestmentPerformanceUpdateResource;
use App\Filament\Resources\InvestmentResource;
use App\Filament\Resources\InvestorOnboardingResource;
use App\Filament\Resources\InvestorProfileResource;
use App\Filament\Resources\OnboardingDocumentResource;
use App\Filament\Resources\OfferingPerformanceUpdateResource;
use App\Filament\Resources\OfferingResource;
use App\Filament\Resources\PaymentResource;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\AuthenticateSession;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->id('admin')
            ->path('admin')
            ->login()
            ->colors([
                'primary' => Color::Blue,
            ])
            ->resources([
                InvestorOnboardingResource::class,
                OnboardingDocumentResource::class,
                InvestorProfileResource::class,
                DocumentResource::class,
                OfferingResource::class,
                FundingInstructionResource::class,
                InvestmentResource::class,
                PaymentResource::class,
                OfferingPerformanceUpdateResource::class,
                InvestmentPerformanceUpdateResource::class,
                AdminAuditLogResource::class,
            ])
            ->pages([
                Dashboard::class,
            ])
            ->widgets([])
            ->globalSearch(false)
            ->databaseNotifications(false)
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                VerifyCsrfToken::class,
                SubstituteBindings::class,
            ])
            ->authMiddleware([
                Authenticate::class,
            ]);
    }
}
