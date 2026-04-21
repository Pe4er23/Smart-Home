<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DeviceController;

// Маршрут: GET /api/devices
Route::get('/devices', [DeviceController::class, 'index']);
// НОВЫЙ МАРШРУТ
Route::post('/devices/{id}/toggle', [DeviceController::class, 'toggle']);