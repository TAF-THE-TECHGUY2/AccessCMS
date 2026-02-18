<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DocumentSubmission;
use App\Models\DocumentType;
use App\Services\DocumentPackageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class InvestorDocumentsController extends Controller
{
    public function checklist(Request $request)
    {
        $profile = $request->user()->investorProfile;
        $types = DocumentType::all();

        $submissions = DocumentSubmission::where('user_id', $request->user()->id)->get();

        $items = $types->map(function ($type) use ($profile, $submissions) {
            $required = $type->required_for_track === 'BOTH' || $type->required_for_track === $profile->investor_track;
            $submission = $submissions->firstWhere('document_type_id', $type->id);
            return [
                'document_type_id' => $type->id,
                'name' => $type->name,
                'code' => $type->code,
                'required' => $required,
                'stage' => $type->stage,
                'status' => $submission?->status ?? 'missing',
                'rejection_reason' => $submission?->rejection_reason,
            ];
        });

        return response()->json([
            'status' => $profile->status,
            'partner_status' => $profile->partner_status,
            'partner_required' => $profile->partner_required,
            'items' => $items,
        ]);
    }

    public function upload(Request $request)
    {
        $data = $request->validate([
            'document_type_id' => ['required', 'exists:document_types,id'],
            'file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ]);

        $docType = DocumentType::find($data['document_type_id']);
        if (!$docType) {
            return response()->json(['message' => 'Document type not found'], 404);
        }

        $profile = $request->user()->investorProfile;
        $required = $docType->required_for_track === 'BOTH' || $docType->required_for_track === $profile->investor_track;
        if (!$required) {
            return response()->json(['message' => 'Document not required for this track'], 403);
        }

        if ($docType->stage === 'signed' && !in_array($profile->status, ['SIGNING_REQUIRED', 'SIGNED_DOCS_PENDING'], true)) {
            return response()->json(['message' => 'Signed documents are not required yet'], 403);
        }

        $disk = config('filesystems.default', 'public');
        $path = $request->file('file')->store('uploads/submissions', $disk);
        if (!$path) {
            Log::error('Investor document upload failed.', ['disk' => $disk, 'user_id' => $request->user()->id]);
            return response()->json(['message' => 'Upload failed'], 500);
        }

        $this->scanForThreats($path, $disk);

        $submission = DocumentSubmission::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'document_type_id' => $data['document_type_id'],
            ],
            [
                'file_path' => $path,
                'disk' => $disk,
                'version' => $docType->version,
                'status' => 'pending',
                'rejection_reason' => null,
                'reviewed_by' => null,
                'reviewed_at' => null,
            ]
        );

        if ($docType->code === 'partner_profile_screenshot') {
            $profile->update([
                'partner_status' => 'submitted',
                'partner_rejection_reason' => null,
                'partner_reviewed_by' => null,
                'partner_reviewed_at' => null,
            ]);
        }

        if ($docType && $docType->stage === 'signed') {
            $request->user()->investorProfile->update(['status' => 'SIGNED_DOCS_PENDING']);
        } else {
            $request->user()->investorProfile->update(['status' => 'PENDING_DOCS']);
        }

        return response()->json(['submission' => $submission]);
    }

    public function package(Request $request, DocumentPackageService $service)
    {
        $profile = $request->user()->investorProfile;
        if ($profile->status !== 'SIGNING_REQUIRED' && $profile->status !== 'SIGNED_DOCS_PENDING') {
            return response()->json(['message' => 'Package not available yet'], 403);
        }

        $package = $service->generateFor($profile);
        $files = collect($package->generated_files)->map(function ($path, $key) {
            $disk = config('filesystems.default', 'public');
            $storage = Storage::disk($disk);
            $url = method_exists($storage, 'temporaryUrl')
                ? $storage->temporaryUrl($path, now()->addMinutes(30))
                : $storage->url($path);
            return [
                'key' => $key,
                'path' => $path,
                'url' => $url,
            ];
        });

        return response()->json([
            'status' => $package->status,
            'files' => $files,
        ]);
    }

    private function scanForThreats(string $path, string $disk): void
    {
        // Placeholder for antivirus/AV engine integration.
        // Example: dispatch(new ScanUploadedFile($disk, $path));
    }
}
