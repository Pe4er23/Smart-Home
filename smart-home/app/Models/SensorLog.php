<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SensorLog extends Model
{
    protected $fillable = ['device_id', 'value'];

    public function device()
    {
        return $this->belongsTo(Device::class);
    }
}