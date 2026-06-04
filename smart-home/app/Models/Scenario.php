<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use PhpMqtt\Client\Facades\MQTT;

class Scenario extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'trigger_device_id',
        'condition', 'trigger_value',
        'action_device_id',
        'action_value',
        'is_active'
        ];

    public function triggerDevice() {
        return $this->belongsTo(Device::class, 'trigger_device_id');
    }

    public function actionDevice() {
        return $this->belongsTo(Device::class, 'action_device_id');
    }

    // МЕХАНИЗМ АВТОМАТИЗАЦИИ
    public static function check(Device $triggerDevice)
    {
        // Ищем все активные сценарии, где это устройство является триггером
        $scenarios = self::where('trigger_device_id', $triggerDevice->id)
                         ->where('is_active', true)
                         ->get();

        foreach ($scenarios as $scenario) {
            $isTriggered = false;
            $currentVal = $triggerDevice->status;
            $targetVal = $scenario->trigger_value;

            // Проверяем условие
            switch ($scenario->condition) {
                case '=':
                    $isTriggered = ($currentVal == $targetVal);
                    break;
                case '>':
                    $isTriggered = (floatval($currentVal) > floatval($targetVal));
                    break;
                case '<':
                    $isTriggered = (floatval($currentVal) < floatval($targetVal));
                    break;
                default:
                    $isTriggered = false;
                    break;
            }

            // Если условие выполнилось, запускаем действие
            if ($isTriggered) {
                $actionDevice = $scenario->actionDevice;
                
                // Защита от бесконечных циклов: отправляем команду только если статус реально нужно изменить
                if ($actionDevice->status != $scenario->action_value) {
                    $actionDevice->status = $scenario->action_value;
                    $actionDevice->save();
                    
                    // Отправляем команду физическому устройству через MQTT
                    MQTT::publish($actionDevice->mqtt_topic, $scenario->action_value);
                    
                    // Мгновенно обновляем интерфейс React через веб-сокеты
                    \App\Events\DeviceUpdated::dispatch($actionDevice);
                }
            }
        }
    }
}