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
        Schema::create('workspace_settings', function (Blueprint $table) {
            $table->id();

            // Satu user hanya punya satu baris pengaturan
            $table->foreignId('user_id')
                ->unique()
                ->constrained()
                ->cascadeOnDelete();

            // Nama panggilan untuk sapaan di dashboard
            $table->string('display_name', 50)->nullable();

            // Berapa hari ke depan tugas masuk reminder
            $table->unsignedTinyInteger('reminder_days')->default(3);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workspace_settings');
    }
};