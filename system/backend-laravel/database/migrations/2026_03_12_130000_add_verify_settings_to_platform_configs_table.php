<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('platform_configs', function (Blueprint $table) {
            $table->string('verify_verification_url', 2048)->nullable()->after('wefunder_provider_name');
            $table->string('verify_provider_name')->nullable()->after('verify_verification_url');
        });
    }

    public function down(): void
    {
        Schema::table('platform_configs', function (Blueprint $table) {
            $table->dropColumn([
                'verify_verification_url',
                'verify_provider_name',
            ]);
        });
    }
};
