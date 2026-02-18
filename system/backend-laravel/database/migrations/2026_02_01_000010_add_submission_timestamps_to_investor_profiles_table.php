<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('investor_profiles', function (Blueprint $table) {
            $table->timestamp('submitted_at')->nullable()->after('partner_reviewed_at');
            $table->timestamp('approved_at')->nullable()->after('submitted_at');
            $table->timestamp('rejected_at')->nullable()->after('approved_at');
        });
    }

    public function down(): void
    {
        Schema::table('investor_profiles', function (Blueprint $table) {
            $table->dropColumn(['submitted_at', 'approved_at', 'rejected_at']);
        });
    }
};
