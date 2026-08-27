<?php

use App\Models\Investigation;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->withHeader('Origin', config('app.url'));

    $admin = User::factory()->create()->syncRoles('admin');
    $this->admin = $admin;
    $this->matter = Investigation::factory()->active()->create(['investigator_id' => $admin->id]);
});

it('lists witnesses for a matter', function () {
    $this->matter->witnesses()->create(['id' => 'wit-test01', 'name' => 'Jane', 'role' => 'Employee', 'relationship' => 'coworker', 'interview_status' => 'not_scheduled']);

    $this->actingAs($this->admin)
        ->getJson("/api/matters/{$this->matter->id}/witnesses")
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

it('creates a witness', function () {
    $this->actingAs($this->admin)
        ->postJson("/api/matters/{$this->matter->id}/witnesses", [
            'name' => 'Jane Doe',
            'role' => 'Employee',
            'relationship' => 'coworker',
            'interviewStatus' => 'not_scheduled',
        ])
        ->assertCreated()
        ->assertJsonPath('data.name', 'Jane Doe');

    expect($this->matter->witnesses()->count())->toBe(1);
});

it('validates store witness requires fields', function () {
    $this->actingAs($this->admin)
        ->postJson("/api/matters/{$this->matter->id}/witnesses", [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'role', 'relationship', 'interviewStatus']);
});

it('updates a witness', function () {
    $witness = $this->matter->witnesses()->create(['id' => 'wit-upd01', 'name' => 'Old', 'role' => 'Employee', 'relationship' => 'coworker', 'interview_status' => 'not_scheduled']);

    $this->actingAs($this->admin)
        ->putJson("/api/matters/{$this->matter->id}/witnesses/{$witness->id}", [
            'name' => 'Updated',
            'interviewStatus' => 'scheduled',
        ])
        ->assertOk()
        ->assertJsonPath('data.name', 'Updated')
        ->assertJsonPath('data.interviewStatus', 'scheduled');
});

it('deletes a witness', function () {
    $witness = $this->matter->witnesses()->create(['id' => 'wit-del01', 'name' => 'Del', 'role' => 'Employee', 'relationship' => 'coworker', 'interview_status' => 'not_scheduled']);

    $this->actingAs($this->admin)
        ->deleteJson("/api/matters/{$this->matter->id}/witnesses/{$witness->id}")
        ->assertNoContent();

    $this->assertDatabaseMissing('witnesses', ['id' => 'wit-del01']);
});

it('rejects unauthenticated witness store', function () {
    $this->postJson("/api/matters/{$this->matter->id}/witnesses", [])->assertUnauthorized();
});
