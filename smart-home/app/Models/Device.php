<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Device extends Model
{
    // Дозволяємо масове заповнення цих полів
    protected $fillable = [
        'name',
        'type',
        'mqtt_topic',
        'status',
    ];
    public function logs()
    {
        return $this->hasMany(SensorLog::class);
    }
}