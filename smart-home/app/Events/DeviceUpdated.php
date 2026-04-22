<?php

namespace App\Events;

use App\Models\Device;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DeviceUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $device;

    // Передаем обновленное устройство в событие
    public function __construct(Device $device)
    {
        $this->device = $device;
    }

    // Указываем канал, по которому React будет слушать обновления
    public function broadcastOn(): array
    {
        return [
            new Channel('home-devices'),
        ];
    }
    
    // Название события для React
    public function broadcastAs(): string
    {
        return 'device.updated';
    }
}