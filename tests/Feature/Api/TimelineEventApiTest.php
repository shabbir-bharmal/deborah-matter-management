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

it('lists timeline events for a matter', function () {
    $this->matter->timelineEvents()->create(['id' => 'tl-test01', 'date' => '2026-08-01', 'type' => 'meeting', 'title' => 'Kick-off', 'description' => 'Initial meeting']);

    $this->actingAs($this->admin)
        ->getJson("/api/matters/{$this->matter->id}/timeline-events")
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

it('creates a timeline event', function () {
    $this->actingAs($this->admin)
        ->postJson("/api/matters/{$this->matter->id}/timeline-events", [
            'date' => '2026-08-15',
            'type' => 'interview',
            'title' => 'Witness interview',
            'description' => 'First interview conducted',
        ])
        ->assertCreated()
        ->assertJsonPath('data.title', 'Witness interview');

    expect($this->matter->timelineEvents()->count())->toBe(1);
});

it('validates store timeline event requires fields', function () {
    $this->actingAs($this->admin)
        ->postJson("/api/matters/{$this->matter->id}/timeline-events", [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['date', 'type', 'title', 'description']);
});

it('updates a timeline event', function () {
    $event = $this->matter->timelineEvents()->create(['id' => 'tl-upd01', 'date' => '2026-08-01', 'type' => 'meeting', 'title' => 'Old', 'description' => 'Desc']);

    $this->actingAs($this->admin)
        ->putJson("/api/matters/{$this->matter->id}/timeline-events/{$event->id}", [
            'title' => 'Updated',
        ])
        ->assertOk()
        ->assertJsonPath('data.title', 'Updated');
});

it('deletes a timeline event', function () {
    $event = $this->matter->timelineEvents()->create(['id' => 'tl-del01', 'date' => '2026-08-01', 'type' => 'meeting', 'title' => 'Del', 'description' => 'Desc']);

    $this->actingAs($this->admin)
        ->deleteJson("/api/matters/{$this->matter->id}/timeline-events/{$event->id}")
        ->assertNoContent();

    $this->assertDatabaseMissing('timeline_events', ['id' => 'tl-del01']);
});

it('rejects unauthenticated timeline event store', function () {
    $this->postJson("/api/matters/{$this->matter->id}/timeline-events", [])->assertUnauthorized();
});
