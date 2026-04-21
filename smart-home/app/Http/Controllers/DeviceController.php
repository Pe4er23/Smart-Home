<?php

namespace App\Http\Controllers;

use App\Models\Device;
use Illuminate\Http\Request;
use PhpMqtt\Client\Facades\MQTT; // ДОБАВЛЯЕМ ЭТУ СТРОКУ

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
            
            // МАГИЯ ЗДЕСЬ: Отправляем новый статус в топик устройства
            MQTT::publish($device->mqtt_topic, $device->status);
        }
        
        return response()->json($device);
    }
}