<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('matter_notes', function (Blueprint $table) {
            $table->id();
            $table->string('investigation_id');
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('author');
            $table->text('body');
            $table->timestamps();

            $table->foreign('investigation_id')->references('id')->on('investigations')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('matter_notes');
    }
};
