<?php

namespace App\Http\Controllers;

use App\Models\Device;
use Illuminate\Http\Request;

class DeviceController extends Controller
{
    // Получить список всех устройств
    public function index()
    {
        $devices = Device::all();
        return response()->json($devices);
    }
}