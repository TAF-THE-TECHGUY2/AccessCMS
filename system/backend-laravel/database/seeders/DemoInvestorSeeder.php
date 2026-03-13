<?php

namespace Database\Seeders;

use App\Models\Investment;
use App\Models\InvestorOnboarding;
use App\Models\InvestorProfile;
use App\Models\Offering;
use App\Models\OnboardingProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoInvestorSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('DEMO_INVESTOR_EMAIL', 'investor-demo@ap.boston');
        $password = env('DEMO_INVESTOR_PASSWORD', 'demo12345');

        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => 'Demo Accredited Investor',
                'password' => Hash::make($password),
                'role' => 'investor',
                'phone' => '+1 617 555 0142',
            ]
        );

        $profile = InvestorProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'investor_type' => InvestorProfile::INVESTOR_TYPE_ACCREDITED,
                'profile_type' => 'individual',
                'full_name' => 'Demo Accredited Investor',
                'phone' => '+1 617 555 0142',
                'email' => $email,
                'address_line1' => '1 Beacon Street',
                'address_line2' => 'Suite 500',
                'city' => 'Boston',
                'state' => 'MA',
                'postal_code' => '02108',
                'country' => 'USA',
                'capital_contribution_amount' => 25000,
                'units_purchased' => 0,
                'equity_percent' => 0,
                'investor_track' => 'ACCREDITED',
                'status' => 'APPROVED',
                'track_status' => InvestorProfile::TRACK_STATUS_ACCREDITED_APPROVED,
                'partner_required' => false,
                'partner_status' => 'not_required',
                'submitted_at' => now()->subDays(3),
                'approved_at' => now()->subDay(),
            ]
        );

        $onboarding = InvestorOnboarding::updateOrCreate(
            ['user_id' => $user->id],
            [
                'experience' => 'yes',
                'investment_amount' => '>=10k',
                'sec_answers' => [
                    'accredited_status' => 'YES',
                    'investor_preference' => 'ACCREDITED_DIRECT',
                    'accredited_eligible' => true,
                ],
                'pathway' => 'accredited',
                'review_status' => 'approved',
                'submitted_at' => now()->subDays(2),
                'approved_at' => now()->subDay(),
                'rejection_reason' => null,
            ]
        );

        OnboardingProfile::updateOrCreate(
            ['onboarding_id' => $onboarding->id],
            [
                'address' => '1 Beacon Street, Suite 500',
                'city' => 'Boston',
                'country' => 'USA',
                'postal_code' => '02108',
                'date_of_birth' => '1988-04-12',
            ]
        );

        $offering = Offering::where('slug', 'greater-boston-fund-i')->first()
            ?? Offering::where('status', 'open')->orderBy('id')->first();

        if (! $offering) {
            return;
        }

        Investment::firstOrCreate(
            [
                'investor_profile_id' => $profile->id,
                'offering_id' => $offering->id,
            ],
            [
                'amount' => 25000,
                'status' => 'pending',
            ]
        );
    }
}
