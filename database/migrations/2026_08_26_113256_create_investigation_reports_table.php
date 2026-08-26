<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * One report per matter — the report builder state the SPA previously held
     * in the Zustand report store.
     */
    public function up(): void
    {
        Schema::create('investigation_reports', function (Blueprint $table) {
            $table->id();
            $table->string('investigation_id')->unique();
            $table->string('status')->default('draft');
            $table->string('title')->default('');
            $table->text('executive_summary')->nullable();
            $table->json('included_sections');
            $table->json('auto_fill');
            $table->json('custom_sections');
            $table->timestamps();

            $table->foreign('investigation_id')->references('id')->on('investigations')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('investigation_reports');
    }
};
