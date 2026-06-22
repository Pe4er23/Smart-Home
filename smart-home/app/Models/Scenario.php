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

    // МЕХАНІЗМ АВТОМАТИЗАЦІЇ
    public static function check(Device $triggerDevice)
    {
        // Шукаємо всі активні сценарії, де цей пристрій є тригером
        $scenarios = self::where('trigger_device_id', $triggerDevice->id)
                         ->where('is_active', true)
                         ->get();

        foreach ($scenarios as $scenario) {
            $isTriggered = false;
            $currentVal = $triggerDevice->status;
            $targetVal = $scenario->trigger_value;

            // Перевіряємо умову
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

            // Якщо умова виконалась, запускаємо дію
            if ($isTriggered) {
                $actionDevice = $scenario->actionDevice;
                
                // Захист від безкінечних циклів: відправляємо команду тільки якщо статус реально потрібно змінити
                if ($actionDevice->status != $scenario->action_value) {
                    $actionDevice->status = $scenario->action_value;
                    $actionDevice->save();
                    
                    // Відправляємо команду фізичному пристрою через MQTT
                    MQTT::publish($actionDevice->mqtt_topic, $scenario->action_value);
                    
                    // Миттєво оновлюємо інтерфейс React через веб-сокети
                    \App\Events\DeviceUpdated::dispatch($actionDevice);
                }
            }
        }
    }
}