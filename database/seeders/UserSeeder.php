<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Superadmin — firstOrCreate so we never overwrite an existing password.
        User::firstOrCreate(
            ['email' => env('SUPERADMIN_EMAIL', 'admin@inventory.test')],
            [
                'name' => env('SUPERADMIN_NAME', 'Super Admin'),
                'password' => bcrypt(env('SUPERADMIN_PASSWORD', 'password')),
                'role' => 'superadmin',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        // Test user — only if not exists.
        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => bcrypt('password'),
                'role' => 'user',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
    }
}
