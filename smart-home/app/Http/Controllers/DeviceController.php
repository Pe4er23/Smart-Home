<?php

namespace App\Http\Controllers;

use App\Models\Device;
use Illuminate\Http\Request;

class DeviceController extends Controller
{
    public function index()
    {
        $devices = Device::all();
        return response()->json($devices);
    }

    // НОВЫЙ МЕТОД ДЛЯ ПЕРЕКЛЮЧЕНИЯ СТАТУСА
    public function toggle($id)
    {
        $device = Device::findOrFail($id); // Ищем устройство по ID
        
        // Меняем статус только у реле (ламп/розеток)
        if ($device->type === 'relay') {
            $device->status = ($device->status === 'on') ? 'off' : 'on';
            $device->save();
            
            // ПРИМЕЧАНИЕ ДЛЯ ДИПЛОМА: Позже именно здесь мы добавим 
            // код для отправки реального сигнала по MQTT на железку!
        }
        
        return response()->json($device); // Возвращаем обновленное устройство
    }
}