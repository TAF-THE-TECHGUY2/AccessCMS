<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Investment;
use App\Models\Offering;
use App\Services\InvestorEligibility;
use App\Services\WorkflowEventService;
use Illuminate\Http\Request;

class InvestmentController extends Controller
{
    public function store(Request $request, WorkflowEventService $events)
    {
        InvestorEligibility::assertKycApproved($request->user());

        $data = $request->validate([
            'offering_id' => ['required', 'exists:offerings,id'],
            'amount' => ['required', 'numeric', 'min:1'],
        ]);

        $offering = Offering::findOrFail($data['offering_id']);
        if ($offering->min_investment && $data['amount'] < $offering->min_investment) {
            return response()->json(['message' => 'Amount is below minimum investment.'], 422);
        }

        $investment = Investment::create([
            'investor_profile_id' => $request->user()->investorProfile->id,
            'offering_id' => $data['offering_id'],
            'amount' => $data['amount'],
            'status' => 'pending',
        ]);

        $events->record($request->user()->investorProfile, null, 'investment_created', null, 'Investment #' . $investment->id);

        return response()->json(['investment' => $investment]);
    }
}
