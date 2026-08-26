<?php

use App\Models\Client;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->withHeader('Origin', config('app.url'));
});

function admin(): User
{
    return User::factory()->create()->syncRoles('admin');
}

it('lists users with their roles', function () {
    $user = admin();

    $this->actingAs($user)
        ->getJson('/api/users')
        ->assertOk()
        ->assertJsonPath('data.0.roles.0', 'admin')
        ->assertJsonCount(1, 'data');
});

it('hides administration from an investigator', function () {
    $user = User::factory()->create()->syncRoles('investigator');

    $this->actingAs($user)->getJson('/api/users')->assertForbidden();
    $this->actingAs($user)->getJson('/api/roles')->assertForbidden();
});

it('creates a portal user bound to a client', function () {
    $client = Client::factory()->create();

    $this->actingAs(admin())
        ->postJson('/api/users', [
            'name' => 'Portal User',
            'email' => 'portal@example.test',
            'password' => 'secret-password',
            'role' => 'client',
            'clientId' => $client->id,
        ])
        ->assertCreated()
        ->assertJsonPath('data.roles.0', 'client')
        ->assertJsonPath('data.clientSlug', $client->slug);
});

it('changes a user role', function () {
    $user = User::factory()->create()->syncRoles('investigator');

    $this->actingAs(admin())
        ->patchJson("/api/users/{$user->id}", ['role' => 'admin'])
        ->assertOk()
        ->assertJsonPath('data.roles.0', 'admin');

    expect($user->fresh()->hasRole('admin'))->toBeTrue();
});

it('refuses to delete your own account', function () {
    $user = admin();

    $this->actingAs($user)->deleteJson("/api/users/{$user->id}")->assertStatus(422);
    $this->actingAs($user)->deleteJson('/api/users/'.User::factory()->create()->id)->assertNoContent();
});

it('returns the role and permission matrix', function () {
    $this->actingAs(admin())
        ->getJson('/api/roles')
        ->assertOk()
        ->assertJsonStructure(['data' => ['roles' => [['id', 'name', 'permissions', 'userCount']], 'permissions']]);
});

it('syncs the permissions granted to a role', function () {
    $role = Role::findByName('client');

    $this->actingAs(admin())
        ->putJson("/api/roles/{$role->id}", ['permissions' => ['investigations.view', 'reports.view']])
        ->assertOk()
        ->assertJsonPath('data.permissions', ['investigations.view', 'reports.view']);

    // A portal user now loses access to the endpoints that ability gated.
    $portal = User::factory()->create()->syncRoles('client');
    $this->actingAs($portal)->getJson('/api/calendar')->assertForbidden();
});
