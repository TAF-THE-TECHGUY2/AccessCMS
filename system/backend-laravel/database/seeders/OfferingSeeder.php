<?php

namespace Database\Seeders;

use App\Models\Offering;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class OfferingSeeder extends Seeder
{
    public function run(): void
    {
        Offering::updateOrCreate(
            ['slug' => 'greater-boston-fund-i'],
            [
                'title' => 'Access Properties Real Estate Diversified Income Fund I (Greater Boston Fund)',
                'summary' => 'Diversified income-focused real estate fund for the Greater Boston market.',
                'target_amount' => 5000000,
                'min_investment' => 10000,
                'max_investment' => 250000,
                'status' => 'open',
                'opened_at' => now()->subDays(30)->toDateString(),
                'closed_at' => null,
            ]
        );

        Offering::updateOrCreate(
            ['slug' => 'greater-boston-income-crowdfunder'],
            [
                'title' => 'Access Properties Crowdfunder Allocation (Greater Boston)',
                'summary' => 'Crowdfunder allocation for smaller-ticket investors seeking Greater Boston exposure.',
                'target_amount' => 1500000,
                'min_investment' => 100,
                'max_investment' => 10000,
                'status' => 'open',
                'opened_at' => now()->subDays(30)->toDateString(),
                'closed_at' => null,
            ]
        );
    }
}
