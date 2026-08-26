<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('timeline_events', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('investigation_id');
            $table->date('date')->index();
            $table->string('type');
            $table->string('title');
            $table->text('description');
            $table->string('related_entity_type')->nullable();
            $table->string('related_entity_id')->nullable();
            $table->string('related_entity_label')->nullable();
            $table->timestamps();

            $table->foreign('investigation_id')->references('id')->on('investigations')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('timeline_events');
    }
};
