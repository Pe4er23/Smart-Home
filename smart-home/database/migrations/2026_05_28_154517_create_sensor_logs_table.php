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
            // Связываем с устройством. onDelete('cascade') удалит историю, если удалить сам датчик
            $table->foreignId('device_id')->constrained('devices')->onDelete('cascade');
            $table->string('value'); // Сама цифра температуры
            $table->timestamps(); // Автоматически создаст колонки created_at и updated_at
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
