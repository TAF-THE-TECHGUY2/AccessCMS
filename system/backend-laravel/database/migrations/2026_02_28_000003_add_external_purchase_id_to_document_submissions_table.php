<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('document_submissions', function (Blueprint $table) {
            $table->foreignId('external_purchase_id')
                ->nullable()
                ->constrained('external_purchases')
                ->nullOnDelete()
                ->after('document_type_id');
        });
    }

    public function down(): void
    {
        Schema::table('document_submissions', function (Blueprint $table) {
            $table->dropForeign(['external_purchase_id']);
            $table->dropColumn('external_purchase_id');
        });
    }
};
