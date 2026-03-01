<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('external_purchases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('offering_id')->constrained()->cascadeOnDelete();
            $table->string('provider')->default('wefunder');
            $table->string('reference')->unique();
            $table->string('redirect_url');
            $table->string('status')->default('awaiting_proof');
            $table->decimal('amount_expected', 12, 2)->nullable();
            $table->decimal('units_expected', 12, 4)->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('external_purchases');
    }
};
