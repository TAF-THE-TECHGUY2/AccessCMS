<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('ADMIN_EMAIL', 'admin@ap.boston');
        $password = env('ADMIN_PASSWORD', 'admin123');

        User::updateOrCreate(
            ['email' => $email],
            [
                'name' => 'Access Admin',
                'password' => Hash::make($password),
                'role' => 'admin',
            ]
        );
    }
}
