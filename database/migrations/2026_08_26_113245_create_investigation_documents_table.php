<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('investigation_documents', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('investigation_id');
            $table->string('name');
            $table->string('type');
            $table->string('status')->index();
            $table->timestamps();

            $table->foreign('investigation_id')->references('id')->on('investigations')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('investigation_documents');
    }
};
