<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('onboarding_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('onboarding_id')->constrained('investor_onboardings')->cascadeOnDelete();
            $table->string('type');
            $table->string('file_path');
            $table->string('disk')->default('public');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('onboarding_documents');
    }
};
