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
        $table->string('name'); // Назва (наприклад, "Лампа на кухні")
        $table->string('type'); // Тип приладу (sensor, relay і т.д.)
        $table->string('mqtt_topic')->unique(); // Унікальний топік для спілкування по MQTT
        $table->string('status')->default('offline'); // Поточний статус (on, off, 25.5, offline)
        $table->timestamps(); // Час створення та останнього оновлення
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
