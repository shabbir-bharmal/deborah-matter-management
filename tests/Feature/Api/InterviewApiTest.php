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
    $this->witness = $this->matter->witnesses()->create(['id' => 'wit-int01', 'name' => 'Test', 'role' => 'Employee', 'relationship' => 'coworker', 'interview_status' => 'not_scheduled']);
});

it('lists interviews for a matter', function () {
    $this->matter->interviews()->create(['id' => 'int-test01', 'witness_id' => $this->witness->id, 'scheduled_at' => '2026-09-01', 'status' => 'scheduled']);

    $this->actingAs($this->admin)
        ->getJson("/api/matters/{$this->matter->id}/interviews")
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

it('creates an interview', function () {
    $this->actingAs($this->admin)
        ->postJson("/api/matters/{$this->matter->id}/interviews", [
            'witnessId' => $this->witness->id,
            'scheduledAt' => '2026-09-15T10:00:00',
            'status' => 'scheduled',
        ])
        ->assertCreated()
        ->assertJsonPath('data.witnessId', $this->witness->id);

    expect($this->matter->interviews()->count())->toBe(1);
});

it('validates store interview requires fields', function () {
    $this->actingAs($this->admin)
        ->postJson("/api/matters/{$this->matter->id}/interviews", [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['witnessId', 'scheduledAt', 'status']);
});

it('updates an interview', function () {
    $interview = $this->matter->interviews()->create(['id' => 'int-upd01', 'witness_id' => $this->witness->id, 'scheduled_at' => '2026-09-01', 'status' => 'scheduled']);

    $this->actingAs($this->admin)
        ->putJson("/api/matters/{$this->matter->id}/interviews/{$interview->id}", [
            'status' => 'completed',
            'notes' => 'Interview completed.',
        ])
        ->assertOk()
        ->assertJsonPath('data.status', 'completed');
});

it('deletes an interview', function () {
    $interview = $this->matter->interviews()->create(['id' => 'int-del01', 'witness_id' => $this->witness->id, 'scheduled_at' => '2026-09-01', 'status' => 'scheduled']);

    $this->actingAs($this->admin)
        ->deleteJson("/api/matters/{$this->matter->id}/interviews/{$interview->id}")
        ->assertNoContent();

    $this->assertDatabaseMissing('interviews', ['id' => 'int-del01']);
});

it('rejects unauthenticated interview store', function () {
    $this->postJson("/api/matters/{$this->matter->id}/interviews", [])->assertUnauthorized();
});
