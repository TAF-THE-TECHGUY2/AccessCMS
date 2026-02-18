<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InvestorProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'full_name' => ['required', 'string', 'max:255'],
            'title' => ['nullable', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(8)],
            'address_line1' => ['required', 'string', 'max:255'],
            'address_line2' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'state' => ['required', 'string', 'max:255'],
            'postal_code' => ['required', 'string', 'max:50'],
            'country' => ['required', 'string', 'max:255'],
            'capital_contribution_amount' => ['required', 'numeric', 'min:0'],
            'units_purchased' => ['nullable', 'integer', 'min:0'],
            'equity_percent' => ['nullable', 'numeric', 'min:0'],
            'investor_track' => ['required', 'in:CROWDFUNDER,ACCREDITED'],
        ]);

        $validator->after(function ($validator) use ($request) {
            $track = $request->input('investor_track');
            $amount = (float) $request->input('capital_contribution_amount', 0);
            if ($track === 'ACCREDITED' && $amount < 10000) {
                $validator->errors()->add('capital_contribution_amount', 'Accredited minimum is $10,000.');
            }
            if ($track === 'CROWDFUNDER' && $amount < 100) {
                $validator->errors()->add('capital_contribution_amount', 'Crowdfunder minimum is $100.');
            }
        });

        $data = $validator->validate();

        $user = User::create([
            'name' => $data['full_name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => 'investor',
        ]);

        $partnerRequired = $data['investor_track'] === 'CROWDFUNDER';

        InvestorProfile::create([
            'user_id' => $user->id,
            'full_name' => $data['full_name'],
            'title' => $data['title'] ?? null,
            'phone' => $data['phone'],
            'email' => $data['email'],
            'address_line1' => $data['address_line1'],
            'address_line2' => $data['address_line2'] ?? null,
            'city' => $data['city'],
            'state' => $data['state'],
            'postal_code' => $data['postal_code'],
            'country' => $data['country'],
            'capital_contribution_amount' => $data['capital_contribution_amount'],
            'units_purchased' => $data['units_purchased'] ?? 0,
            'equity_percent' => $data['equity_percent'] ?? 0,
            'investor_track' => $data['investor_track'],
            'status' => 'PENDING_DOCS',
            'partner_required' => $partnerRequired,
            'partner_status' => $partnerRequired ? 'required' : 'not_required',
        ]);

        $token = $user->createToken('investor-portal')->plainTextToken;

        return response()->json([
            'user' => $user->load('investorProfile'),
            'token' => $token,
        ]);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (!Auth::attempt($data)) {
            return response()->json(['message' => 'Invalid credentials'], 422);
        }

        $user = $request->user();
        $token = $user->createToken('investor-portal')->plainTextToken;

        return response()->json([
            'user' => $user->load('investorProfile'),
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();
        return response()->json(['message' => 'Logged out']);
    }

    public function me(Request $request)
    {
        return response()->json(['user' => $request->user()->load('investorProfile')]);
    }
}
