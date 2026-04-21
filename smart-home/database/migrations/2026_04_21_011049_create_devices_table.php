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
    Schema::create('devices', function (Blueprint $table) {
        $table->id();
        $table->string('name'); // Название (например, "Лампа на кухне")
        $table->string('type'); // Тип устройства (sensor, relay и т.д.)
        $table->string('mqtt_topic')->unique(); // Уникальный топик для общения по MQTT
        $table->string('status')->default('offline'); // Текущий статус (on, off, 25.5, offline)
        $table->timestamps(); // Время создания и последнего обновления
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('devices');
    }
};
