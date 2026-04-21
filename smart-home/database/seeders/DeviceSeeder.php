<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Device; // Обязательно подключаем нашу модель!

class DeviceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Создаем Умную лампу
        Device::create([
            'name' => 'Лампа на кухне',
            'type' => 'relay',
            'mqtt_topic' => 'home/kitchen/lamp',
            'status' => 'off',
        ]);

        // Создаем Датчик температуры
        Device::create([
            'name' => 'Датчик температуры (Зал)',
            'type' => 'sensor',
            'mqtt_topic' => 'home/livingroom/temp',
            'status' => '22.5',
        ]);
    }
}