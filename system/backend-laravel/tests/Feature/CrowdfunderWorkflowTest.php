<?php

namespace Tests\Feature;

use App\Models\DocumentType;
use App\Models\ExternalPurchase;
use App\Models\Investment;
use App\Models\InvestorProfile;
use App\Models\Offering;
use App\Models\Payment;
use App\Models\User;
use App\Services\ExternalPurchaseService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CrowdfunderWorkflowTest extends TestCase
{
    use RefreshDatabase;

    private function createCrowdfunder(string $status, ?string $trackStatus = null): User
    {
        $user = User::factory()->create(['role' => 'investor']);

        InvestorProfile::create([
            'user_id' => $user->id,
            'full_name' => 'Crowdfunder Investor',
            'phone' => '555-0200',
            'email' => $user->email,
            'address_line1' => '12 Main St',
            'city' => 'Boston',
            'state' => 'MA',
            'postal_code' => '02101',
            'country' => 'USA',
            'investor_track' => 'CROWDFUNDER',
            'status' => $status,
            'track_status' => $trackStatus,
        ]);

        return $user;
    }

    private function createOffering(): Offering
    {
        return Offering::create([
            'title' => 'Crowdfunder Fund',
            'slug' => 'crowdfunder-fund',
            'summary' => 'Test',
            'min_investment' => 100,
            'status' => 'open',
        ]);
    }

    public function test_crowdfunder_cannot_create_external_purchase_until_kyc_approved(): void
    {
        $user = $this->createCrowdfunder('PENDING_DOCS');
        $offering = $this->createOffering();

        Sanctum::actingAs($user);
        $this->postJson('/api/crowdfunder/purchases', [
            'offering_id' => $offering->id,
            'amount_expected' => 500,
        ])
            ->assertStatus(403)
            ->assertJson(['message' => 'KYC not approved yet']);
    }

    public function test_crowdfunder_can_create_external_purchase_when_kyc_approved(): void
    {
        config(['services.wefunder.campaign_url' => 'https://wefunder.example/campaign']);
        $user = $this->createCrowdfunder('APPROVED', InvestorProfile::TRACK_STATUS_CROWDFUNDER_ACTIVE);
        $offering = $this->createOffering();

        Sanctum::actingAs($user);
        $this->postJson('/api/crowdfunder/purchases', [
            'offering_id' => $offering->id,
            'amount_expected' => 500,
        ])
            ->assertOk()
            ->assertJsonStructure(['purchase_id', 'mode', 'provider', 'reference', 'redirect_url']);
    }

    public function test_crowdfunder_cannot_upload_proof_until_kyc_approved(): void
    {
        $user = $this->createCrowdfunder('PENDING_DOCS');
        $offering = $this->createOffering();
        $purchase = ExternalPurchase::create([
            'user_id' => $user->id,
            'offering_id' => $offering->id,
            'provider' => 'wefunder',
            'reference' => 'CF-TEST',
            'redirect_url' => 'https://wefunder.example/test',
            'status' => ExternalPurchase::STATUS_AWAITING_PROOF,
        ]);

        Sanctum::actingAs($user);
        $this->postJson("/api/crowdfunder/purchases/{$purchase->id}/proof", [
            'file' => UploadedFile::fake()->create('proof.pdf', 10, 'application/pdf'),
        ])
            ->assertStatus(403)
            ->assertJson(['message' => 'KYC not approved yet']);
    }

    public function test_crowdfunder_can_upload_proof_when_kyc_approved(): void
    {
        Storage::fake('public');
        config(['filesystems.default' => 'public']);

        DocumentType::create([
            'name' => 'Shares/Ownership Confirmation',
            'code' => 'shares_confirmation',
            'required_for_track' => 'CROWDFUNDER',
            'stage' => 'external',
            'version' => '1.0',
        ]);

        $user = $this->createCrowdfunder('APPROVED', InvestorProfile::TRACK_STATUS_CROWDFUNDER_ACTIVE);
        $offering = $this->createOffering();
        $purchase = ExternalPurchase::create([
            'user_id' => $user->id,
            'offering_id' => $offering->id,
            'provider' => 'wefunder',
            'reference' => 'CF-TEST-APPROVED',
            'redirect_url' => 'https://wefunder.example/test',
            'status' => ExternalPurchase::STATUS_AWAITING_PROOF,
        ]);

        Sanctum::actingAs($user);
        $this->postJson("/api/crowdfunder/purchases/{$purchase->id}/proof", [
            'file' => UploadedFile::fake()->create('proof.pdf', 10, 'application/pdf'),
        ])
            ->assertOk()
            ->assertJson(['status' => ExternalPurchase::STATUS_PENDING_REVIEW]);
    }

    public function test_admin_approve_purchase_creates_active_portfolio_allocation(): void
    {
        $user = $this->createCrowdfunder('APPROVED', InvestorProfile::TRACK_STATUS_CROWDFUNDER_ACTIVE);
        $offering = $this->createOffering();
        $purchase = ExternalPurchase::create([
            'user_id' => $user->id,
            'offering_id' => $offering->id,
            'provider' => 'wefunder',
            'reference' => 'CF-APPROVE',
            'redirect_url' => 'https://wefunder.example/test',
            'status' => ExternalPurchase::STATUS_PENDING_REVIEW,
            'amount_expected' => 1000,
        ]);

        $allocation = app(ExternalPurchaseService::class)->approve($purchase, 1);
        $this->assertEquals('active', $allocation->status);
        $this->assertEquals($purchase->amount_expected, $allocation->amount);
    }

    public function test_accredited_workflow_still_allows_investment_and_payment_proof(): void
    {
        Storage::fake('public');
        config(['filesystems.default' => 'public']);

        DocumentType::create([
            'name' => 'Payment Proof',
            'code' => 'payment_proof',
            'required_for_track' => 'BOTH',
            'stage' => 'payment',
            'version' => '1.0',
        ]);

        $user = User::factory()->create(['role' => 'investor']);
        InvestorProfile::create([
            'user_id' => $user->id,
            'full_name' => 'Accredited Investor',
            'phone' => '555-0300',
            'email' => $user->email,
            'address_line1' => '10 Main St',
            'city' => 'Boston',
            'state' => 'MA',
            'postal_code' => '02101',
            'country' => 'USA',
            'investor_track' => 'ACCREDITED',
            'status' => 'APPROVED',
            'track_status' => InvestorProfile::TRACK_STATUS_ACCREDITED_APPROVED,
        ]);

        $offering = Offering::create([
            'title' => 'Accredited Fund',
            'slug' => 'accredited-fund',
            'summary' => 'Test',
            'min_investment' => 100,
            'status' => 'open',
        ]);

        Sanctum::actingAs($user);
        $investmentResponse = $this->postJson('/api/investments', [
            'offering_id' => $offering->id,
            'amount' => 1000,
        ])->assertOk();

        $investmentId = $investmentResponse->json('investment.id');

        $this->postJson('/api/payments/proof', [
            'investment_id' => $investmentId,
            'amount' => 1000,
            'file' => UploadedFile::fake()->create('proof.pdf', 10, 'application/pdf'),
        ])->assertOk();

        $this->assertDatabaseHas('payments', ['investment_id' => $investmentId]);
    }
}
