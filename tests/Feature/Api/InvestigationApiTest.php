<?php

use App\Models\Client;
use App\Models\Investigation;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);

    // Sanctum only treats a request as stateful when it carries a browser origin.
    $this->withHeader('Origin', config('app.url'));
});

function investigator(): User
{
    return User::factory()->create()->syncRoles('investigator');
}

function portalUser(Client $client): User
{
    return User::factory()->create(['client_id' => $client->id])->syncRoles('client');
}

it('rejects unauthenticated api requests', function () {
    $this->getJson('/api/matters')->assertUnauthorized();
});

it('logs a user in and returns their permissions', function () {
    $user = investigator();

    $this->postJson('/api/login', ['email' => $user->email, 'password' => 'password'])
        ->assertOk()
        ->assertJsonPath('data.email', $user->email)
        ->assertJsonPath('data.roles.0', 'investigator');

    expect(auth()->check())->toBeTrue();
});

it('rejects a bad password', function () {
    $user = investigator();

    $this->postJson('/api/login', ['email' => $user->email, 'password' => 'wrong'])
        ->assertStatus(422);
});

it('lists every matter for staff', function () {
    Investigation::factory()->count(3)->create();

    $this->actingAs(investigator())
        ->getJson('/api/matters')
        ->assertOk()
        ->assertJsonCount(3, 'data');
});

it('limits a portal user to their own client', function () {
    $client = Client::factory()->create();
    $own = Investigation::factory()->create(['client_id' => $client->id]);
    $other = Investigation::factory()->create();

    $response = $this->actingAs(portalUser($client))->getJson('/api/matters')->assertOk();

    expect($response->json('data.*.id'))->toBe([$own->id]);

    $this->actingAs(portalUser($client))->getJson("/api/matters/{$other->id}")->assertForbidden();
});

it('returns a matter payload shaped like the SPA types', function () {
    $matter = Investigation::factory()->create();

    $this->actingAs(investigator())
        ->getJson("/api/matters/{$matter->id}")
        ->assertOk()
        ->assertJsonPath('data.referenceNumber', $matter->reference_number)
        ->assertJsonStructure(['data' => ['id', 'referenceNumber', 'title', 'client', 'type', 'status', 'priority', 'investigator', 'openedAt', 'targetCompletionDate', 'description']]);
});

it('builds the dashboard snapshot', function () {
    Investigation::factory()->active()->count(2)->create();

    $this->actingAs(investigator())
        ->getJson('/api/dashboard')
        ->assertOk()
        ->assertJsonPath('data.activeMatterCount', 2)
        ->assertJsonStructure(['data' => ['statusCounts', 'priorityCounts', 'upcomingInterviews', 'recentActivity', 'pendingActions']]);
});

it('records a finding on an allegation', function () {
    $matter = Investigation::factory()->create();
    $allegation = $matter->allegations()->create(['id' => 'alg-find01', 'title' => 'T', 'description' => 'D', 'category' => 'harassment', 'status' => 'under_review']);

    $this->actingAs(investigator())
        ->putJson("/api/matters/{$matter->id}/allegations/{$allegation->id}", ['finding' => 'substantiated', 'findingNotes' => 'Corroborated by two witnesses.'])
        ->assertOk()
        ->assertJsonPath('data.finding', 'substantiated');

    expect($allegation->refresh()->finding_notes)->toBe('Corroborated by two witnesses.');
});

it('blocks a portal user from recording findings', function () {
    $matter = Investigation::factory()->create();
    $allegation = $matter->allegations()->create(['id' => 'alg-find02', 'title' => 'T', 'description' => 'D', 'category' => 'harassment', 'status' => 'under_review']);

    $this->actingAs(portalUser(Client::factory()->create()))
        ->putJson("/api/matters/{$matter->id}/allegations/{$allegation->id}", ['finding' => 'substantiated'])
        ->assertForbidden();
});

it('stores and deletes a matter note', function () {
    $matter = Investigation::factory()->create();
    $user = investigator();

    $noteId = $this->actingAs($user)
        ->postJson("/api/matters/{$matter->id}/notes", ['body' => 'Called HR for the roster.'])
        ->assertCreated()
        ->assertJsonPath('data.author', $user->name)
        ->json('data.id');

    $this->actingAs($user)->getJson("/api/matters/{$matter->id}/notes")->assertJsonCount(1, 'data');
    $this->actingAs($user)->deleteJson("/api/matters/{$matter->id}/notes/{$noteId}")->assertNoContent();
    $this->actingAs($user)->getJson("/api/matters/{$matter->id}/notes")->assertJsonCount(0, 'data');
});

it('persists the report builder state', function () {
    $matter = Investigation::factory()->create();

    $this->actingAs(investigator())
        ->putJson("/api/matters/{$matter->id}/report", [
            'status' => 'final',
            'title' => 'Final report',
            'includedSections' => ['summary' => true],
        ])
        ->assertSuccessful()
        ->assertJsonPath('data.status', 'final');

    $this->actingAs(investigator())
        ->getJson("/api/matters/{$matter->id}/report")
        ->assertJsonPath('data.title', 'Final report')
        ->assertJsonPath('data.includedSections.summary', true);
});

it('stores a new matter', function () {
    $client = Client::factory()->create();

    $this->actingAs(investigator())
        ->postJson('/api/matters', [
            'title' => 'Harassment complaint',
            'clientId' => $client->id,
            'type' => 'harassment',
            'status' => 'open',
            'priority' => 'high',
            'openedAt' => '2026-08-27',
            'targetCompletionDate' => '2026-11-27',
            'description' => 'Formal complaint filed.',
        ])
        ->assertCreated()
        ->assertJsonPath('data.title', 'Harassment complaint')
        ->assertJsonPath('data.clientId', $client->id)
        ->assertJsonStructure(['data' => ['id', 'referenceNumber', 'title', 'clientId', 'type', 'status', 'priority']]);

    $this->assertDatabaseCount('investigations', 1);
    $this->assertDatabaseCount('investigation_reports', 1);
});

it('rejects store with missing required fields', function () {
    $this->actingAs(investigator())
        ->postJson('/api/matters', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['title', 'clientId', 'type', 'status', 'priority', 'openedAt', 'targetCompletionDate', 'description']);
});

it('updates an existing matter', function () {
    $matter = Investigation::factory()->create(['status' => 'open']);

    $this->actingAs(investigator())
        ->putJson("/api/matters/{$matter->id}", [
            'title' => 'Updated title',
            'status' => 'in_progress',
        ])
        ->assertOk()
        ->assertJsonPath('data.title', 'Updated title');

    $this->assertDatabaseHas('investigations', ['id' => $matter->id, 'status' => 'in_progress']);
});

it('auto-sets completed_at when status changes to completed', function () {
    $matter = Investigation::factory()->create(['status' => 'in_progress', 'completed_at' => null]);

    $this->actingAs(investigator())
        ->putJson("/api/matters/{$matter->id}", ['status' => 'completed'])
        ->assertOk();

    $this->assertNotNull($matter->fresh()->completed_at);
});

it('clears completed_at when status changes away from completed', function () {
    $matter = Investigation::factory()->create(['status' => 'completed', 'completed_at' => now()]);

    $this->actingAs(investigator())
        ->putJson("/api/matters/{$matter->id}", ['status' => 'in_progress'])
        ->assertOk();

    $this->assertNull($matter->fresh()->completed_at);
});

it('deletes a matter', function () {
    $matter = Investigation::factory()->create();

    $admin = User::factory()->create()->syncRoles('admin');

    $this->actingAs($admin)
        ->deleteJson("/api/matters/{$matter->id}")
        ->assertNoContent();

    $this->assertDatabaseMissing('investigations', ['id' => $matter->id]);
});

it('rejects unauthenticated store', function () {
    $this->postJson('/api/matters', [])->assertUnauthorized();
});

it('rejects unauthenticated update', function () {
    $matter = Investigation::factory()->create();

    $this->putJson("/api/matters/{$matter->id}", [])->assertUnauthorized();
});

it('rejects unauthenticated delete', function () {
    $matter = Investigation::factory()->create();

    $this->deleteJson("/api/matters/{$matter->id}")->assertUnauthorized();
});

it('returns the new clientId and investigatorId fields', function () {
    $matter = Investigation::factory()->create();

    $response = $this->actingAs(investigator())
        ->getJson("/api/matters/{$matter->id}")
        ->assertOk();

    expect($response->json('data.clientId'))->toBe($matter->client_id);
    expect($response->json('data.investigatorId'))->toBe($matter->investigator_id);
});
