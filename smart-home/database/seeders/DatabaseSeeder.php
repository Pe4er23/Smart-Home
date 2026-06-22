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
        // Викликаємо наш сидер пристроїв
        $this->call([
            DeviceSeeder::class,
        ]);
    }
}