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

it('lists notes for a matter', function () {
    $this->matter->notes()->create(['id' => 'note-test01', 'user_id' => $this->admin->id, 'author' => $this->admin->name, 'body' => 'Test note']);

    $this->actingAs($this->admin)
        ->getJson("/api/matters/{$this->matter->id}/notes")
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

it('creates a note', function () {
    $this->actingAs($this->admin)
        ->postJson("/api/matters/{$this->matter->id}/notes", [
            'body' => 'Called the client today.',
        ])
        ->assertCreated()
        ->assertJsonPath('data.body', 'Called the client today.');

    expect($this->matter->notes()->count())->toBe(1);
});

it('validates store note requires body', function () {
    $this->actingAs($this->admin)
        ->postJson("/api/matters/{$this->matter->id}/notes", [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['body']);
});

it('updates a note', function () {
    $note = $this->matter->notes()->create(['id' => 'note-upd01', 'user_id' => $this->admin->id, 'author' => $this->admin->name, 'body' => 'Old']);

    $this->actingAs($this->admin)
        ->putJson("/api/matters/{$this->matter->id}/notes/{$note->id}", [
            'body' => 'Updated note.',
        ])
        ->assertOk()
        ->assertJsonPath('data.body', 'Updated note.');
});

it('deletes a note', function () {
    $note = $this->matter->notes()->create(['id' => 'note-del01', 'user_id' => $this->admin->id, 'author' => $this->admin->name, 'body' => 'Del']);

    $this->actingAs($this->admin)
        ->deleteJson("/api/matters/{$this->matter->id}/notes/{$note->id}")
        ->assertNoContent();

    $this->assertDatabaseMissing('matter_notes', ['id' => 'note-del01']);
});

it('rejects unauthenticated note store', function () {
    $this->postJson("/api/matters/{$this->matter->id}/notes", [])->assertUnauthorized();
});
