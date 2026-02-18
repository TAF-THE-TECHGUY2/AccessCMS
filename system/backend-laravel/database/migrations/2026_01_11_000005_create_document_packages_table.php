<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_packages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->json('generated_files')->nullable();
            $table->string('status')->default('pending'); // pending|ready
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_packages');
    }
};
