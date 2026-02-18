<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('offerings', function (Blueprint $table) {
            $table->decimal('target_amount', 14, 2)->nullable()->after('summary');
            $table->date('opened_at')->nullable()->after('status');
            $table->date('closed_at')->nullable()->after('opened_at');
        });
    }

    public function down(): void
    {
        Schema::table('offerings', function (Blueprint $table) {
            $table->dropColumn(['target_amount', 'opened_at', 'closed_at']);
        });
    }
};
