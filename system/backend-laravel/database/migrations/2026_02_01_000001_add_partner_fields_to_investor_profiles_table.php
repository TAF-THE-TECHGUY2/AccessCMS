<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('investor_profiles', function (Blueprint $table) {
            $table->boolean('partner_required')->default(false)->after('track_status');
            $table->string('partner_status')->default('not_required')->after('partner_required');
            $table->string('partner_profile_url')->nullable()->after('partner_status');
            $table->text('partner_rejection_reason')->nullable()->after('partner_profile_url');
            $table->foreignId('partner_reviewed_by')->nullable()->constrained('users')->nullOnDelete()->after('partner_rejection_reason');
            $table->timestamp('partner_reviewed_at')->nullable()->after('partner_reviewed_by');
        });
    }

    public function down(): void
    {
        Schema::table('investor_profiles', function (Blueprint $table) {
            $table->dropForeign(['partner_reviewed_by']);
            $table->dropColumn([
                'partner_required',
                'partner_status',
                'partner_profile_url',
                'partner_rejection_reason',
                'partner_reviewed_by',
                'partner_reviewed_at',
            ]);
        });
    }
};
