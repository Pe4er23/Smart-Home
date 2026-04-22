<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use PhpMqtt\Client\Facades\MQTT;
use App\Models\Device;
use App\Events\DeviceUpdated;

class MqttListener extends Command
{
    protected $signature = 'mqtt:listen';
    protected $description = 'Слушает MQTT топики датчиков 24/7';

    public function handle()
    {
        $this->info("Запуск слушателя MQTT...");

        // 1. Получаем объект подключения
        $mqtt = MQTT::connection();

        // 2. Вызываем subscribe у объекта подключения
        $mqtt->subscribe('home/livingroom/temp', function (string $topic, string $message) {
            
            $this->info("Отримано дані: [$topic] -> $message");

            $device = Device::where('mqtt_topic', $topic)->first();

            if ($device) {
                $device->status = $message;
                $device->save();

                DeviceUpdated::dispatch($device);
            }
        });

        // 3. Вызываем loop у объекта подключения
        $mqtt->loop(true);
    }
}