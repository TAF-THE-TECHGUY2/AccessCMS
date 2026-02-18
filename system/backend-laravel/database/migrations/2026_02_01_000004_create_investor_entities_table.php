<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('investor_entities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('investor_profile_id')->constrained()->cascadeOnDelete();
            $table->string('legal_name');
            $table->string('registration_no')->nullable();
            $table->string('jurisdiction')->nullable();
            $table->json('beneficial_owners_json')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('investor_entities');
    }
};
