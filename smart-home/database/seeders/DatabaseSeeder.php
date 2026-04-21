<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Вызываем наш сидер устройств
        $this->call([
            DeviceSeeder::class,
        ]);
    }
}