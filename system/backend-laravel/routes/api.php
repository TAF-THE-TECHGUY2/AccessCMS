<?php

use App\Http\Controllers\Api\Admin\DocumentReviewController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\InvestorDocumentsController;
use App\Http\Controllers\Api\InvestorDashboardController;
use App\Http\Controllers\Api\InvestorProfileController;
use App\Http\Controllers\Api\InvestorWorkflowController;
use App\Http\Controllers\Api\OfferingController;
use App\Http\Controllers\Api\InvestmentController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\OnboardingController;
use App\Http\Controllers\Api\OnboardingDocumentController;
use App\Http\Controllers\Api\AccreditationController;
use App\Http\Controllers\Api\CrowdfunderPurchaseController;
use Illuminate\Support\Facades\Route;

Route::middleware(['throttle:20,1'])->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
});

Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/auth/me', [AuthController::class, 'me'])->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/investor/profile', [InvestorProfileController::class, 'show']);
    Route::patch('/investor/profile', [InvestorProfileController::class, 'update']);
    Route::get('/investor/dashboard', [InvestorDashboardController::class, 'show']);
    Route::post('/investor/submit', [InvestorWorkflowController::class, 'submit']);
    Route::get('/investor/status', [InvestorWorkflowController::class, 'status']);
    Route::post('/investor/agreement/accept', [InvestorWorkflowController::class, 'acceptAgreement']);
    Route::get('/investor/documents', [InvestorDocumentsController::class, 'checklist']);
    Route::post('/investor/documents/upload', [InvestorDocumentsController::class, 'upload']);
    Route::get('/investor/documents/package', [InvestorDocumentsController::class, 'package']);
    Route::get('/offerings', [OfferingController::class, 'index']);
    Route::post('/investments', [InvestmentController::class, 'store']);
    Route::post('/payments/proof', [PaymentController::class, 'uploadProof']);
    Route::post('/crowdfunder/purchases', [CrowdfunderPurchaseController::class, 'store']);
    Route::post('/crowdfunder/purchases/{purchase}/proof', [CrowdfunderPurchaseController::class, 'uploadProof']);

    Route::post('/onboarding/basic', [OnboardingController::class, 'basic']);
    Route::post('/onboarding/experience', [OnboardingController::class, 'experience']);
    Route::post('/onboarding/sec', [OnboardingController::class, 'sec']);
    Route::post('/onboarding/pathway', [OnboardingController::class, 'pathway']);
    Route::post('/onboarding/profile', [OnboardingController::class, 'profile']);
    Route::post('/onboarding/documents', [OnboardingDocumentController::class, 'upload']);
    Route::post('/onboarding/accreditation', [AccreditationController::class, 'store']);
    Route::get('/onboarding/state', [OnboardingController::class, 'state']);
    Route::get('/onboarding/status', [OnboardingController::class, 'status']);
    Route::get('/onboarding/funding', [OnboardingController::class, 'funding']);
});

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/admin/documents/{submission}/approve', [DocumentReviewController::class, 'approve']);
    Route::post('/admin/documents/{submission}/reject', [DocumentReviewController::class, 'reject']);
});
