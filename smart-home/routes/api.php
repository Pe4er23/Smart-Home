<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\AuthController;

// Маршрут: GET /api/devices

Route::post('/login', [AuthController::class, 'login']);

// Заглушка, яка рятує від помилки "Route [login] not defined" при простроченому токені
Route::get('/login', function () {
    return response()->json(['message' => 'Не авторизовано'], 401);
})->name('login');

Route::middleware('auth:sanctum')->group(function () {
    
    Route::post('/logout', [AuthController::class, 'logout']);

    // Пристрої
    Route::get('/devices', [DeviceController::class, 'index']);
    Route::post('/devices/{id}/toggle', [DeviceController::class, 'toggle']);
    Route::post('/devices/{id}/state', [DeviceController::class, 'updateState']);
    Route::get('/devices/{id}/history', [DeviceController::class, 'history']);

    // Сценарії
    Route::get('/scenarios', [ScenarioController::class, 'index']);
    Route::post('/scenarios', [ScenarioController::class, 'store']);
    Route::delete('/scenarios/{id}', [ScenarioController::class, 'destroy']);
});
