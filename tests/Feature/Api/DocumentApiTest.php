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

it('lists documents for a matter', function () {
    $this->matter->documents()->create(['id' => 'doc-test01', 'name' => 'Plan', 'type' => 'plan', 'status' => 'draft']);

    $this->actingAs($this->admin)
        ->getJson("/api/matters/{$this->matter->id}/documents")
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

it('creates a document', function () {
    $this->actingAs($this->admin)
        ->postJson("/api/matters/{$this->matter->id}/documents", [
            'name' => 'Investigation plan',
            'type' => 'plan',
            'status' => 'draft',
        ])
        ->assertCreated()
        ->assertJsonPath('data.name', 'Investigation plan');

    expect($this->matter->documents()->count())->toBe(1);
});

it('validates store document requires fields', function () {
    $this->actingAs($this->admin)
        ->postJson("/api/matters/{$this->matter->id}/documents", [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'type', 'status']);
});

it('updates a document', function () {
    $document = $this->matter->documents()->create(['id' => 'doc-upd01', 'name' => 'Old', 'type' => 'plan', 'status' => 'draft']);

    $this->actingAs($this->admin)
        ->putJson("/api/matters/{$this->matter->id}/documents/{$document->id}", [
            'name' => 'Updated',
            'status' => 'final',
        ])
        ->assertOk()
        ->assertJsonPath('data.name', 'Updated')
        ->assertJsonPath('data.status', 'final');
});

it('deletes a document', function () {
    $document = $this->matter->documents()->create(['id' => 'doc-del01', 'name' => 'Del', 'type' => 'plan', 'status' => 'draft']);

    $this->actingAs($this->admin)
        ->deleteJson("/api/matters/{$this->matter->id}/documents/{$document->id}")
        ->assertNoContent();

    $this->assertDatabaseMissing('investigation_documents', ['id' => 'doc-del01']);
});

it('rejects unauthenticated document store', function () {
    $this->postJson("/api/matters/{$this->matter->id}/documents", [])->assertUnauthorized();
});
