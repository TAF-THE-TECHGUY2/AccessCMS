<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Investment;
use App\Models\InvestmentPerformanceUpdate;
use App\Models\OfferingPerformanceUpdate;
use App\Models\Payment;
use Illuminate\Http\Request;

class InvestorDashboardController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();
        $profile = $user->investorProfile;

        if (! $profile) {
            return response()->json(['message' => 'Investor profile not found'], 404);
        }

        $investments = Investment::with(['offering'])
            ->where('investor_profile_id', $profile->id)
            ->get()
            ->map(function (Investment $investment) {
                $investmentUpdate = InvestmentPerformanceUpdate::where('investment_id', $investment->id)
                    ->orderByDesc('as_of_date')
                    ->first();

                $offeringUpdate = OfferingPerformanceUpdate::where('offering_id', $investment->offering_id)
                    ->orderByDesc('as_of_date')
                    ->first();

                $roi = $investmentUpdate?->roi_percent ?? $offeringUpdate?->roi_percent;
                $currentValue = $investmentUpdate?->current_value;

                if ($currentValue === null && $roi !== null) {
                    $currentValue = $investment->amount * (1 + ($roi / 100));
                }

                return [
                    'id' => $investment->id,
                    'offering' => $investment->offering,
                    'amount' => $investment->amount,
                    'status' => $investment->status,
                    'funded_at' => $investment->funded_at,
                    'current_value' => $currentValue,
                    'roi_percent' => $roi,
                    'as_of_date' => $investmentUpdate?->as_of_date ?? $offeringUpdate?->as_of_date,
                ];
            });

        $payments = Payment::whereHas('investment', function ($query) use ($profile) {
                $query->where('investor_profile_id', $profile->id);
            })
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Payment $payment) => [
                'id' => $payment->id,
                'investment_id' => $payment->investment_id,
                'amount' => $payment->amount,
                'status' => $payment->status,
                'proof_document_id' => $payment->proof_document_id,
                'created_at' => $payment->created_at,
            ]);

        return response()->json([
            'profile' => $profile,
            'investments' => $investments,
            'payments' => $payments,
        ]);
    }
}
