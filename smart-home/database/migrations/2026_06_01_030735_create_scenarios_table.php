<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('scenarios', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            
            // ТРИГГЕР (ЕСЛИ)
            $table->foreignId('trigger_device_id')->constrained('devices')->onDelete('cascade');
            $table->string('condition'); // Условие: '=', '>', '<'
            $table->string('trigger_value'); // При каком значении сработает
            
            // ДЕЙСТВИЕ (ТО)
            $table->foreignId('action_device_id')->constrained('devices')->onDelete('cascade');
            $table->string('action_value'); // Какую команду отправить
            
            $table->boolean('is_active')->default(true); // Включен ли сценарий
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scenarios');
    }
};
