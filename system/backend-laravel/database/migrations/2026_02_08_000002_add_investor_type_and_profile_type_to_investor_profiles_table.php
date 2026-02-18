<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('investor_profiles', function (Blueprint $table) {
            $table->string('investor_type')->default('accredited')->after('user_id');
            $table->string('profile_type')->nullable()->after('investor_type');
        });
    }

    public function down(): void
    {
        Schema::table('investor_profiles', function (Blueprint $table) {
            $table->dropColumn(['investor_type', 'profile_type']);
        });
    }
};
