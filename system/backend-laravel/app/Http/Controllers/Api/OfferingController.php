<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Offering;

class OfferingController extends Controller
{
    public function index()
    {
        $offerings = Offering::where('status', 'open')->get();
        return response()->json(['offerings' => $offerings]);
    }
}
