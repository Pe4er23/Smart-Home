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

    // Передаємо оновлений пристрій у подію
    public function __construct(Device $device)
    {
        $this->device = $device;
    }

    // Указуємо канал, по якому React буде слухати оновлення
    public function broadcastOn(): array
    {
        return [
            new Channel('home-devices'),
        ];
    }
    
    // Назва події для React
    public function broadcastAs(): string
    {
        return 'device.updated';
    }
}
