<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('interviews', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('investigation_id');
            $table->string('witness_id');
            $table->foreignId('interviewer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('scheduled_at');
            $table->string('status')->index();
            $table->text('notes')->nullable();
            $table->json('transcript_excerpt')->nullable();
            $table->timestamps();

            $table->foreign('investigation_id')->references('id')->on('investigations')->cascadeOnDelete();
            $table->foreign('witness_id')->references('id')->on('witnesses')->cascadeOnDelete();
        });

        Schema::create('allegation_interview', function (Blueprint $table) {
            $table->string('interview_id');
            $table->string('allegation_id');

            $table->primary(['interview_id', 'allegation_id']);
            $table->foreign('interview_id')->references('id')->on('interviews')->cascadeOnDelete();
            $table->foreign('allegation_id')->references('id')->on('allegations')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('allegation_interview');
        Schema::dropIfExists('interviews');
    }
};
