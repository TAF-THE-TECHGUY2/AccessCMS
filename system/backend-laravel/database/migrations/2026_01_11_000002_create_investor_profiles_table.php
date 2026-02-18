<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('investor_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('full_name');
            $table->string('title')->nullable();
            $table->string('phone');
            $table->string('email');
            $table->string('address_line1');
            $table->string('address_line2')->nullable();
            $table->string('city');
            $table->string('state');
            $table->string('postal_code');
            $table->string('country')->default('USA');
            $table->date('effective_date')->nullable();
            $table->decimal('capital_contribution_amount', 12, 2)->default(0);
            $table->integer('units_purchased')->default(0);
            $table->decimal('equity_percent', 6, 3)->default(0);
            $table->string('investor_track')->default('CROWDFUNDER');
            $table->string('status')->default('PENDING_DOCS');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('investor_profiles');
    }
};
