<?php

namespace App\Services;

use App\Models\DocumentPackage;
use App\Models\InvestorProfile;
use Illuminate\Support\Facades\Storage;

class DocumentPackageService
{
    public function generateFor(InvestorProfile $profile): DocumentPackage
    {
        $userId = $profile->user_id;
        $basePath = "uploads/packages/{$userId}";
        $disk = config('filesystems.default', 'public');

        $files = [
            'mipa' => "{$basePath}/MIPA.pdf",
            'joinder' => "{$basePath}/Joinder.pdf",
            'acknowledgement' => "{$basePath}/Acknowledgement.pdf",
        ];

        $placeholder = $this->buildPlaceholderText($profile);

        foreach ($files as $path) {
            Storage::disk($disk)->put($path, $placeholder);
        }

        return DocumentPackage::updateOrCreate(
            ['user_id' => $userId],
            ['generated_files' => $files, 'status' => 'ready']
        );
    }

    private function buildPlaceholderText(InvestorProfile $profile): string
    {
        return implode("\n", [
            "Document Package Placeholder",
            "Effective Date: " . ($profile->effective_date?->format('Y-m-d') ?? now()->format('Y-m-d')),
            "Full Name: {$profile->full_name}",
            "Title: {$profile->title}",
            "Phone: {$profile->phone}",
            "Email: {$profile->email}",
            "Address: {$profile->address_line1} {$profile->address_line2}",
            "City/State/Postal: {$profile->city}, {$profile->state} {$profile->postal_code}",
            "Country: {$profile->country}",
            "Capital Contribution: {$profile->capital_contribution_amount}",
            "Units Purchased: {$profile->units_purchased}",
            "Equity Percent: {$profile->equity_percent}",
        ]);
    }
}
