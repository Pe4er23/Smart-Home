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
            
            // ТРИГГЕР (ЯКЩО)
            $table->foreignId('trigger_device_id')->constrained('devices')->onDelete('cascade');
            $table->string('condition'); // Умова: '=', '>', '<'
            $table->string('trigger_value'); // При якому значенні спрацює
            
            // ДІЯ (ТО)
            $table->foreignId('action_device_id')->constrained('devices')->onDelete('cascade');
            $table->string('action_value'); // Яку команду відправити
            
            $table->boolean('is_active')->default(true);
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
