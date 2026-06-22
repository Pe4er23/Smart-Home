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
            
            // Відправляємо подію по WebSocket
            DeviceUpdated::dispatch($device);
        }
        
        return response()->json($device);
    }

    public function updateState(Request $request, $id)
    {
        $device = Device::findOrFail($id);
        
        $newValue = $request->input('value');
        
        $device->status = $newValue;
        $device->save();

        // Відправляємо це значення в Mosquitto
        MQTT::publish($device->mqtt_topic, $newValue);

        // Повідомляємо React по веб-сокетам, що статус змінився
        \App\Events\DeviceUpdated::dispatch($device);
        // Перевіряємо сценарії автоматизації
        \App\Models\Scenario::check($device);

        return response()->json($device);
    }
    
    /*
        Був створений для побудови графіка зміни температури,
        але не працює бібліотека Recharts в нових версіях React.
        Чекати оновлення?
    */
    public function history($id)
    {
        $device = Device::findOrFail($id);

        // Отримуємо дані тільки за останні 6 годин
        $logs = $device->logs()
                       ->where('created_at', '>=', now()->subHours(6))
                       ->orderBy('created_at', 'asc')
                       ->get();

        return response()->json($logs);
    }
}