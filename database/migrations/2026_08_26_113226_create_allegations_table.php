<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('allegations', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('investigation_id');
            $table->string('title');
            $table->text('description');
            $table->string('category');
            $table->string('status')->index();
            $table->string('finding')->nullable();
            $table->text('finding_notes')->nullable();
            $table->timestamps();

            $table->foreign('investigation_id')->references('id')->on('investigations')->cascadeOnDelete();
        });

        Schema::create('allegation_witness', function (Blueprint $table) {
            $table->string('allegation_id');
            $table->string('witness_id');

            $table->primary(['allegation_id', 'witness_id']);
            $table->foreign('allegation_id')->references('id')->on('allegations')->cascadeOnDelete();
            $table->foreign('witness_id')->references('id')->on('witnesses')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('allegation_witness');
        Schema::dropIfExists('allegations');
    }
};
