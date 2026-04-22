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
}