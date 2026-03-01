<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('portfolio_allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('offering_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 12, 2)->nullable();
            $table->decimal('units', 12, 4)->nullable();
            $table->string('source')->default('external');
            $table->string('status')->default('inactive');
            $table->date('as_of_date')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('portfolio_allocations');
    }
};
