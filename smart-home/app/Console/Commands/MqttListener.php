<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use PhpMqtt\Client\Facades\MQTT;
use App\Models\Device;
use App\Models\SensorLog;
use App\Events\DeviceUpdated;

class MqttListener extends Command
{
    protected $signature = 'mqtt:listen';
    protected $description = 'Слушает MQTT топики датчиков 24/7';

    public function handle()
    {
        $this->info("Запуск слушателя MQTT...");

        // 1. Отримуємо об'єкт підключення до MQTT брокера
        $mqtt = MQTT::connection();

        // 2. Підписуємося на всі топіки, що починаються з "home/"
        $mqtt->subscribe('home/#', function (string $topic, string $message) {
            
            $this->info("Отримано дані: [$topic] -> $message");

            $device = Device::where('mqtt_topic', $topic)->first();

            if ($device) {
                $device->status = $message;
                $device->save();

                // Запись в историю
                SensorLog::create([
                    'device_id' => $device->id,
                    'value' => $message,
                ]);

                \App\Events\DeviceUpdated::dispatch($device);

                \App\Models\Scenario::check($device);

                DeviceUpdated::dispatch($device);
            }
        });

        // 3. Викликаємо loop у об'єкта підключення
        $mqtt->loop(true);
    }
}
