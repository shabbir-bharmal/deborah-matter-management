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

it('creates a client with a unique slug', function () {
    $this->actingAs(admin())
        ->postJson('/api/clients', [
            'name' => 'Acme Holdings',
            'contactEmail' => 'contact@acme.test',
        ])
        ->assertCreated()
        ->assertJsonPath('data.name', 'Acme Holdings')
        ->assertJsonPath('data.contactEmail', 'contact@acme.test');

    $this->assertDatabaseHas('clients', [
        'name' => 'Acme Holdings',
        'slug' => 'acme-holdings',
        'contact_email' => 'contact@acme.test',
    ]);
});

it('updates a client and refreshes its summary payload', function () {
    $client = Client::factory()->create([
        'name' => 'Northwind Logistics',
        'slug' => 'northwind-logistics',
        'contact_email' => 'ops@northwind.test',
    ]);

    $this->actingAs(admin())
        ->putJson("/api/clients/{$client->slug}", [
            'name' => 'Northwind Logistics Group',
            'contactEmail' => 'support@northwind.test',
        ])
        ->assertOk()
        ->assertJsonPath('data.name', 'Northwind Logistics Group')
        ->assertJsonPath('data.contactEmail', 'support@northwind.test');

    $this->assertDatabaseHas('clients', [
        'id' => $client->id,
        'name' => 'Northwind Logistics Group',
        'slug' => 'northwind-logistics-group',
        'contact_email' => 'support@northwind.test',
    ]);
});

it('deletes a client', function () {
    $client = Client::factory()->create();

    $this->actingAs(admin())
        ->deleteJson("/api/clients/{$client->slug}")
        ->assertNoContent();

    $this->assertDatabaseMissing('clients', ['id' => $client->id]);
});

it('hides administration from an investigator', function () {
    $user = User::factory()->create()->syncRoles('investigator');

    $this->actingAs($user)->getJson('/api/users')->assertForbidden();
    $this->actingAs($user)->getJson('/api/roles')->assertForbidden();
});

it('lists assignable staff and lets an investigator use it', function () {
    $investigator = User::factory()->create()->syncRoles('investigator');
    User::factory()->create()->syncRoles('client');

    $this->actingAs($investigator)
        ->getJson('/api/users/assignable')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $investigator->id);
});

it('excludes portal users from assignable staff', function () {
    $staff = User::factory()->create()->syncRoles('admin');
    User::factory()->create()->syncRoles('client');

    $this->actingAs($staff)
        ->getJson('/api/users/assignable')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $staff->id);
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
