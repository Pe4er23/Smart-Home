<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Device;

class DeviceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Создаем Умную лампу на кухне
        Device::create([
            'name' => 'Лампа на кухні',
            'type' => 'relay',
            'mqtt_topic' => 'home/kitchen/lamp',
            'status' => 'off',
        ]);

        // Создаем Датчик температуры в гостиной
        Device::create([
            'name' => 'Датчик температури у вітальні',
            'type' => 'sensor',
            'mqtt_topic' => 'home/livingroom/temp',
            'status' => '22.5',
        ]);
    }
}