<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Device extends Model
{
    // Разрешаем массовое заполнение этих полей
    protected $fillable = [
        'name',
        'type',
        'mqtt_topic',
        'status',
    ];
}