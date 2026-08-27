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

it('lists allegations for a matter', function () {
    $this->matter->allegations()->create(['id' => 'alg-test01', 'title' => 'Test', 'description' => 'Desc', 'category' => 'harassment', 'status' => 'pending']);

    $this->actingAs($this->admin)
        ->getJson("/api/matters/{$this->matter->id}/allegations")
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

it('creates an allegation', function () {
    $this->actingAs($this->admin)
        ->postJson("/api/matters/{$this->matter->id}/allegations", [
            'title' => 'Bullying',
            'description' => 'Verbal bullying by supervisor',
            'category' => 'harassment',
            'status' => 'pending',
        ])
        ->assertCreated()
        ->assertJsonPath('data.title', 'Bullying');

    expect($this->matter->allegations()->count())->toBe(1);
});

it('validates store allegation requires fields', function () {
    $this->actingAs($this->admin)
        ->postJson("/api/matters/{$this->matter->id}/allegations", [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['title', 'description', 'category', 'status']);
});

it('updates an allegation', function () {
    $allegation = $this->matter->allegations()->create(['id' => 'alg-upd01', 'title' => 'Old', 'description' => 'Desc', 'category' => 'harassment', 'status' => 'pending']);

    $response = $this->actingAs($this->admin)
        ->putJson("/api/matters/{$this->matter->id}/allegations/{$allegation->id}", [
            'title' => 'New',
            'finding' => 'substantiated',
            'findingNotes' => 'Corroborated.',
        ]);
    $response->assertOk()
        ->assertJsonPath('data.title', 'New')
        ->assertJsonPath('data.finding', 'substantiated');

    expect($allegation->fresh()->finding_notes)->toBe('Corroborated.');
});

it('deletes an allegation', function () {
    $allegation = $this->matter->allegations()->create(['id' => 'alg-del01', 'title' => 'Del', 'description' => 'Desc', 'category' => 'harassment', 'status' => 'pending']);

    $this->actingAs($this->admin)
        ->deleteJson("/api/matters/{$this->matter->id}/allegations/{$allegation->id}")
        ->assertNoContent();

    $this->assertDatabaseMissing('allegations', ['id' => 'alg-del01']);
});

it('rejects unauthenticated allegation store', function () {
    $this->postJson("/api/matters/{$this->matter->id}/allegations", [])->assertUnauthorized();
});
