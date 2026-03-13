<?php

namespace App\Services;

use App\Models\PlatformConfig;

class PlatformConfigService
{
    public function current(): PlatformConfig
    {
        return PlatformConfig::firstOrCreate(
            ['id' => 1],
            [
                'wefunder_campaign_url' => config('services.wefunder.campaign_url'),
                'wefunder_provider_name' => config('services.wefunder.provider_name', 'Wefunder'),
                'verify_verification_url' => config('services.verify.verification_url'),
                'verify_provider_name' => config('services.verify.provider_name', 'Verify.com'),
            ]
        );
    }

    public function wefunderCampaignUrl(): ?string
    {
        return $this->current()->wefunder_campaign_url ?: config('services.wefunder.campaign_url');
    }

    public function wefunderProviderName(): string
    {
        return $this->current()->wefunder_provider_name ?: config('services.wefunder.provider_name', 'Wefunder');
    }

    public function verifyVerificationUrl(): ?string
    {
        return $this->current()->verify_verification_url ?: config('services.verify.verification_url');
    }

    public function verifyProviderName(): string
    {
        return $this->current()->verify_provider_name ?: config('services.verify.provider_name', 'Verify.com');
    }

    public function update(array $data): PlatformConfig
    {
        $config = $this->current();
        $config->fill($data);
        $config->save();

        return $config->refresh();
    }
}
