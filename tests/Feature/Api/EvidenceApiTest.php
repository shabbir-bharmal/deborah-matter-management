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

it('lists evidence for a matter', function () {
    $this->matter->evidence()->create(['id' => 'evd-test01', 'title' => 'Email', 'type' => 'email', 'source' => 'HR', 'date' => '2026-08-01', 'status' => 'received', 'description' => 'Key email', 'metadata' => '[]']);

    $this->actingAs($this->admin)
        ->getJson("/api/matters/{$this->matter->id}/evidence")
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

it('creates evidence', function () {
    $this->actingAs($this->admin)
        ->postJson("/api/matters/{$this->matter->id}/evidence", [
            'title' => 'Chat log',
            'type' => 'chat_log',
            'source' => 'Slack export',
            'date' => '2026-08-15',
            'status' => 'received',
            'description' => 'Relevant messages',
            'metadata' => [],
        ])
        ->assertCreated()
        ->assertJsonPath('data.title', 'Chat log');

    expect($this->matter->evidence()->count())->toBe(1);
});

it('validates store evidence requires fields', function () {
    $this->actingAs($this->admin)
        ->postJson("/api/matters/{$this->matter->id}/evidence", [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['title', 'type', 'source', 'date', 'status', 'description']);
});

it('updates evidence', function () {
    $evidence = $this->matter->evidence()->create(['id' => 'evd-upd01', 'title' => 'Old', 'type' => 'document', 'source' => 'HR', 'date' => '2026-08-01', 'status' => 'received', 'description' => 'Desc', 'metadata' => '[]']);

    $this->actingAs($this->admin)
        ->putJson("/api/matters/{$this->matter->id}/evidence/{$evidence->id}", [
            'title' => 'Updated',
            'status' => 'reviewed',
        ])
        ->assertOk()
        ->assertJsonPath('data.title', 'Updated')
        ->assertJsonPath('data.status', 'reviewed');
});

it('deletes evidence', function () {
    $evidence = $this->matter->evidence()->create(['id' => 'evd-del01', 'title' => 'Del', 'type' => 'document', 'source' => 'HR', 'date' => '2026-08-01', 'status' => 'received', 'description' => 'Desc', 'metadata' => '[]']);

    $this->actingAs($this->admin)
        ->deleteJson("/api/matters/{$this->matter->id}/evidence/{$evidence->id}")
        ->assertNoContent();

    $this->assertDatabaseMissing('evidence', ['id' => 'evd-del01']);
});

it('rejects unauthenticated evidence store', function () {
    $this->postJson("/api/matters/{$this->matter->id}/evidence", [])->assertUnauthorized();
});
