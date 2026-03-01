<?php

namespace Tests\Feature;

use App\Models\DocumentType;
use App\Models\FundingInstruction;
use App\Models\Investment;
use App\Models\InvestorOnboarding;
use App\Models\InvestorProfile;
use App\Models\Offering;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class KycGateTest extends TestCase
{
    use RefreshDatabase;

    private function createUserWithProfile(string $status, ?string $trackStatus = null): User
    {
        $user = User::factory()->create(['role' => 'investor']);

        InvestorProfile::create([
            'user_id' => $user->id,
            'full_name' => 'Test Investor',
            'phone' => '555-0100',
            'email' => $user->email,
            'address_line1' => '123 Main St',
            'city' => 'Boston',
            'state' => 'MA',
            'postal_code' => '02101',
            'country' => 'USA',
            'investor_track' => 'ACCREDITED',
            'status' => $status,
            'track_status' => $trackStatus,
        ]);

        return $user;
    }

    private function createAdminWithProfile(string $status, ?string $trackStatus = null): User
    {
        $user = User::factory()->create(['role' => 'admin']);

        InvestorProfile::create([
            'user_id' => $user->id,
            'full_name' => 'Admin Investor',
            'phone' => '555-0101',
            'email' => $user->email,
            'address_line1' => '1 Admin Way',
            'city' => 'Boston',
            'state' => 'MA',
            'postal_code' => '02101',
            'country' => 'USA',
            'investor_track' => 'ACCREDITED',
            'status' => $status,
            'track_status' => $trackStatus,
        ]);

        return $user;
    }

    private function approveOnboarding(User $user): void
    {
        InvestorOnboarding::create([
            'user_id' => $user->id,
            'review_status' => 'approved',
        ]);
    }

    public function test_funding_instructions_blocked_until_kyc_approved(): void
    {
        $user = $this->createUserWithProfile('PENDING_DOCS');
        $this->approveOnboarding($user);
        FundingInstruction::create([
            'bank_name' => 'Test Bank',
            'account_name' => 'Access Fund',
            'routing_number' => '123456789',
            'account_number' => '000123456',
            'reference_template' => 'Investor {id}',
            'is_active' => true,
        ]);

        Sanctum::actingAs($user);
        $this->getJson('/api/onboarding/funding')
            ->assertStatus(403)
            ->assertJson(['message' => 'KYC not approved yet']);
    }

    public function test_funding_instructions_allowed_when_kyc_approved(): void
    {
        $user = $this->createUserWithProfile('APPROVED', 'ACCREDITED_APPROVED');
        $this->approveOnboarding($user);
        FundingInstruction::create([
            'bank_name' => 'Test Bank',
            'account_name' => 'Access Fund',
            'routing_number' => '123456789',
            'account_number' => '000123456',
            'reference_template' => 'Investor {id}',
            'is_active' => true,
        ]);

        Sanctum::actingAs($user);
        $this->getJson('/api/onboarding/funding')
            ->assertOk()
            ->assertJsonStructure(['bank_name', 'account_name', 'account_number', 'reference']);
    }

    public function test_investment_creation_blocked_until_kyc_approved(): void
    {
        $user = $this->createUserWithProfile('PENDING_DOCS');
        $offering = Offering::create([
            'title' => 'Test Fund',
            'slug' => 'test-fund',
            'summary' => 'Test',
            'min_investment' => 100,
            'status' => 'open',
        ]);

        Sanctum::actingAs($user);
        $this->postJson('/api/investments', [
            'offering_id' => $offering->id,
            'amount' => 1000,
        ])
            ->assertStatus(403)
            ->assertJson(['message' => 'KYC not approved yet']);
    }

    public function test_investment_creation_allowed_when_kyc_approved(): void
    {
        $user = $this->createUserWithProfile('APPROVED', 'ACCREDITED_APPROVED');
        $offering = Offering::create([
            'title' => 'Test Fund',
            'slug' => 'test-fund-approved',
            'summary' => 'Test',
            'min_investment' => 100,
            'status' => 'open',
        ]);

        Sanctum::actingAs($user);
        $this->postJson('/api/investments', [
            'offering_id' => $offering->id,
            'amount' => 1000,
        ])
            ->assertOk()
            ->assertJsonStructure(['investment' => ['id', 'offering_id', 'amount', 'status']]);
    }

    public function test_payment_proof_upload_blocked_until_kyc_approved(): void
    {
        $user = $this->createUserWithProfile('PENDING_DOCS');
        $offering = Offering::create([
            'title' => 'Test Fund',
            'slug' => 'test-fund-payment',
            'summary' => 'Test',
            'min_investment' => 100,
            'status' => 'open',
        ]);
        $investment = Investment::create([
            'investor_profile_id' => $user->investorProfile->id,
            'offering_id' => $offering->id,
            'amount' => 1000,
            'status' => 'pending',
        ]);

        Sanctum::actingAs($user);
        $this->postJson('/api/payments/proof', [
            'investment_id' => $investment->id,
            'amount' => 1000,
            'file' => UploadedFile::fake()->create('proof.pdf', 10, 'application/pdf'),
        ])
            ->assertStatus(403)
            ->assertJson(['message' => 'KYC not approved yet']);
    }

    public function test_payment_proof_upload_allowed_when_kyc_approved(): void
    {
        Storage::fake('public');
        config(['filesystems.default' => 'public']);

        DocumentType::create([
            'name' => 'Payment Proof',
            'code' => 'payment_proof',
            'required_for_track' => 'BOTH',
            'stage' => 'initial',
            'version' => '1.0',
        ]);

        $user = $this->createUserWithProfile('APPROVED', 'ACCREDITED_APPROVED');
        $offering = Offering::create([
            'title' => 'Test Fund',
            'slug' => 'test-fund-payment-approved',
            'summary' => 'Test',
            'min_investment' => 100,
            'status' => 'open',
        ]);
        $investment = Investment::create([
            'investor_profile_id' => $user->investorProfile->id,
            'offering_id' => $offering->id,
            'amount' => 1000,
            'status' => 'pending',
        ]);

        Sanctum::actingAs($user);
        $this->postJson('/api/payments/proof', [
            'investment_id' => $investment->id,
            'amount' => 1000,
            'file' => UploadedFile::fake()->create('proof.pdf', 10, 'application/pdf'),
        ])
            ->assertOk()
            ->assertJsonStructure(['payment' => ['id', 'investment_id', 'amount', 'status']]);
    }

    public function test_admin_bypasses_kyc_gate_for_three_endpoints(): void
    {
        Storage::fake('public');
        config(['filesystems.default' => 'public']);

        DocumentType::create([
            'name' => 'Payment Proof',
            'code' => 'payment_proof',
            'required_for_track' => 'BOTH',
            'stage' => 'initial',
            'version' => '1.0',
        ]);

        $user = $this->createAdminWithProfile('PENDING_DOCS');
        $this->approveOnboarding($user);
        FundingInstruction::create([
            'bank_name' => 'Test Bank',
            'account_name' => 'Access Fund',
            'routing_number' => '123456789',
            'account_number' => '000123456',
            'reference_template' => 'Investor {id}',
            'is_active' => true,
        ]);
        $offering = Offering::create([
            'title' => 'Admin Fund',
            'slug' => 'admin-fund',
            'summary' => 'Test',
            'min_investment' => 100,
            'status' => 'open',
        ]);
        $investment = Investment::create([
            'investor_profile_id' => $user->investorProfile->id,
            'offering_id' => $offering->id,
            'amount' => 1000,
            'status' => 'pending',
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/onboarding/funding')
            ->assertOk();

        $this->postJson('/api/investments', [
            'offering_id' => $offering->id,
            'amount' => 1000,
        ])
            ->assertOk();

        $this->postJson('/api/payments/proof', [
            'investment_id' => $investment->id,
            'amount' => 1000,
            'file' => UploadedFile::fake()->create('proof.pdf', 10, 'application/pdf'),
        ])
            ->assertOk();
    }

    public function test_investor_approved_without_track_status_is_blocked(): void
    {
        $user = $this->createUserWithProfile('APPROVED', null);
        $this->approveOnboarding($user);
        FundingInstruction::create([
            'bank_name' => 'Test Bank',
            'account_name' => 'Access Fund',
            'routing_number' => '123456789',
            'account_number' => '000123456',
            'reference_template' => 'Investor {id}',
            'is_active' => true,
        ]);

        Sanctum::actingAs($user);
        $this->getJson('/api/onboarding/funding')
            ->assertStatus(403)
            ->assertJson(['message' => 'KYC not approved yet']);
    }
}
