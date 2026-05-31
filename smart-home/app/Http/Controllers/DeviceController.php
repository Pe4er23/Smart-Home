<?php

namespace App\Http\Controllers;

use App\Models\Device;
use Illuminate\Http\Request;
use PhpMqtt\Client\Facades\MQTT;
use App\Events\DeviceUpdated;

class DeviceController extends Controller
{
    public function index()
    {
        $devices = Device::all();
        return response()->json($devices);
    }

    public function toggle($id)
    {
        $device = Device::findOrFail($id);
        
        if ($device->type === 'relay') {
            $device->status = ($device->status === 'on') ? 'off' : 'on';
            $device->save();
            
            MQTT::publish($device->mqtt_topic, $device->status);
            
            // Отправляем событие по WebSocket
            DeviceUpdated::dispatch($device);
        }
        
        return response()->json($device);
    }

    // Новый универсальный метод управления
    public function updateState(Request $request, $id)
    {
        $device = Device::findOrFail($id);
        
        // Получаем новое значение из React (например, цвет "#ff0000" или статус "on")
        $newValue = $request->input('value');
        
        $device->status = $newValue;
        $device->save();

        // Отправляем это значение в Mosquitto
        MQTT::publish($device->mqtt_topic, $newValue);

        // Сообщаем React по веб-сокетам, что статус изменился
        \App\Events\DeviceUpdated::dispatch($device);

        return response()->json($device);
    }
    
    public function history($id)
    {
        $device = Device::findOrFail($id);

        // Получаем данные только за последние 6 часов
        $logs = $device->logs()
                       ->where('created_at', '>=', now()->subHours(6))
                       ->orderBy('created_at', 'asc') // Сразу сортируем по времени (от старых к новым)
                       ->get();

        return response()->json($logs);
    }
}