<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InvestorProfile;
use Illuminate\Http\Request;

class InvestorProfileController extends Controller
{
    public function show(Request $request)
    {
        return response()->json([
            'profile' => $request->user()->investorProfile,
        ]);
    }

    public function update(Request $request)
    {
        $profile = $request->user()->investorProfile;

        $data = $request->validate([
            'full_name' => ['sometimes', 'string', 'max:255'],
            'title' => ['nullable', 'string', 'max:255'],
            'phone' => ['sometimes', 'string', 'max:50'],
            'email' => ['sometimes', 'email', 'max:255'],
            'address_line1' => ['sometimes', 'string', 'max:255'],
            'address_line2' => ['nullable', 'string', 'max:255'],
            'city' => ['sometimes', 'string', 'max:255'],
            'state' => ['sometimes', 'string', 'max:255'],
            'postal_code' => ['sometimes', 'string', 'max:50'],
            'country' => ['sometimes', 'string', 'max:255'],
            'capital_contribution_amount' => ['sometimes', 'numeric', 'min:0'],
            'units_purchased' => ['sometimes', 'integer', 'min:0'],
            'equity_percent' => ['sometimes', 'numeric', 'min:0'],
            'partner_profile_url' => ['nullable', 'url', 'max:500'],
        ]);

        $profile->update($data);
        return response()->json(['profile' => $profile]);
    }
}
