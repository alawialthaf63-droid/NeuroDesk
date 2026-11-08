<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            // Primary key
            $table->id();

            // Relasi dengan user
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            // Informasi task
            $table->string('title');
            $table->text('description')->nullable();

            // Prioritas task
            $table->enum('priority', [
                'low',
                'medium',
                'high',
            ])->default('medium');

            // Status task
            $table->enum('status', [
                'pending',
                'in_progress',
                'completed',
            ])->default('pending');

            // Deadline
            $table->date('due_date')->nullable();

            // Waktu pembuatan dan update
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};