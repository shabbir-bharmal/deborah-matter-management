<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * String primary keys mirror the reference ids the SPA already routes on
     * (`inv-001`), so seeded URLs and API payloads stay identical.
     */
    public function up(): void
    {
        Schema::create('investigations', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('reference_number')->unique();
            $table->string('title');
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->foreignId('investigator_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('type');
            $table->string('status')->index();
            $table->string('priority')->index();
            $table->date('opened_at');
            $table->date('target_completion_date');
            $table->date('completed_at')->nullable();
            $table->text('description');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('investigations');
    }
};
