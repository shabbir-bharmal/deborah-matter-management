<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Demo logins. Investigator accounts come from InvestigationSeeder — this adds
 * the administrator and one portal user per client. Password is `password`.
 */
class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@investigations.test'],
            ['name' => 'Alex Mercer', 'password' => 'password', 'email_verified_at' => now()],
        )->syncRoles('admin');

        Client::each(function (Client $client): void {
            User::firstOrCreate(
                ['email' => 'portal@'.$client->slug.'.test'],
                [
                    'name' => $client->name.' Portal',
                    'password' => 'password',
                    'client_id' => $client->id,
                    'email_verified_at' => now(),
                ],
            )->syncRoles('client');
        });
    }
}
