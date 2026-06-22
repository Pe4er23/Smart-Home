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
        Schema::create('sensor_logs', function (Blueprint $table) {
            $table->id();
            // Зв'язуємо з пристроєм. onDelete('cascade') видалить історію, якщо видалити сам датчик
            $table->foreignId('device_id')->constrained('devices')->onDelete('cascade');
            $table->string('value'); // Сама цифра температури
            $table->timestamps(); // Автоматично створить колонки created_at та updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sensor_logs');
    }
};
