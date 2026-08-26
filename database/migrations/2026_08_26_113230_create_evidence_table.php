<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evidence', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('investigation_id');
            $table->string('title');
            $table->string('type');
            $table->string('source');
            $table->date('date');
            $table->string('status')->index();
            $table->text('description');
            $table->json('metadata');
            $table->timestamps();

            $table->foreign('investigation_id')->references('id')->on('investigations')->cascadeOnDelete();
        });

        /**
         * `relation` distinguishes the three links the UI shows separately:
         * related / supports / contradicts.
         */
        Schema::create('allegation_evidence', function (Blueprint $table) {
            $table->string('evidence_id');
            $table->string('allegation_id');
            $table->string('relation');

            $table->primary(['evidence_id', 'allegation_id', 'relation'], 'allegation_evidence_primary');
            $table->foreign('evidence_id')->references('id')->on('evidence')->cascadeOnDelete();
            $table->foreign('allegation_id')->references('id')->on('allegations')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('allegation_evidence');
        Schema::dropIfExists('evidence');
    }
};
