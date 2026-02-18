<?php

namespace Database\Seeders;

use App\Models\FundingInstruction;
use Illuminate\Database\Seeder;

class FundingInstructionSeeder extends Seeder
{
    public function run(): void
    {
        FundingInstruction::firstOrCreate(
            ['bank_name' => 'First National Bank', 'account_number' => '000123456789'],
            [
                'account_name' => 'Access Properties Fund I',
                'routing_number' => '123456789',
                'reference_template' => 'Investor {id}',
                'is_active' => true,
            ]
        );
    }
}
