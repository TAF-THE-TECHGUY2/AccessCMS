<?php

namespace Database\Seeders;

use App\Models\DocumentType;
use Illuminate\Database\Seeder;

class DocumentTypeSeeder extends Seeder
{
    public function run(): void
    {
        DocumentType::truncate();

        $types = [
            ['code' => 'government_id', 'name' => 'Government ID', 'required_for_track' => 'BOTH', 'stage' => 'initial'],
            ['code' => 'proof_of_address', 'name' => 'Proof of Address', 'required_for_track' => 'BOTH', 'stage' => 'initial'],
            ['code' => 'tax_form', 'name' => 'W-9/W-8 Tax Form', 'required_for_track' => 'BOTH', 'stage' => 'initial'],
            ['code' => 'accreditation_evidence', 'name' => 'Accreditation Evidence', 'required_for_track' => 'ACCREDITED', 'stage' => 'initial'],
            ['code' => 'partner_profile_screenshot', 'name' => 'Partner Profile Screenshot', 'required_for_track' => 'CROWDFUNDER', 'stage' => 'initial'],
            ['code' => 'payment_proof', 'name' => 'Payment Proof', 'required_for_track' => 'BOTH', 'stage' => 'payment'],
            ['code' => 'shares_confirmation', 'name' => 'Shares/Ownership Confirmation', 'required_for_track' => 'CROWDFUNDER', 'stage' => 'external'],
            ['code' => 'signed_mipa', 'name' => 'Signed MIPA', 'required_for_track' => 'BOTH', 'stage' => 'signed'],
            ['code' => 'signed_joinder', 'name' => 'Signed Joinder', 'required_for_track' => 'BOTH', 'stage' => 'signed'],
            ['code' => 'signed_acknowledgement', 'name' => 'Signed Acknowledgement', 'required_for_track' => 'BOTH', 'stage' => 'signed'],
        ];

        foreach ($types as $type) {
            DocumentType::create([
                'name' => $type['name'],
                'code' => $type['code'],
                'required_for_track' => $type['required_for_track'],
                'stage' => $type['stage'],
                'version' => '1.0',
            ]);
        }
    }
}
