<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Password reset emails should link to the investor SPA, not a Laravel route.
        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            $frontendUrl = rtrim(config('app.frontend_url'), '/');

            return $frontendUrl . '/reset-password?token=' . $token
                . '&email=' . urlencode($notifiable->getEmailForPasswordReset());
        });
    }
}
