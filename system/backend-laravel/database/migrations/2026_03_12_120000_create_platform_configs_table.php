<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('platform_configs', function (Blueprint $table) {
            $table->id();
            $table->string('wefunder_campaign_url', 2048)->nullable();
            $table->string('wefunder_provider_name')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('platform_configs');
    }
};
