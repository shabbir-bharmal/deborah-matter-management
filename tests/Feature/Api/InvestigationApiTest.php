<?php

use App\Models\Allegation;
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
    $this->getJson('/api/investigations')->assertUnauthorized();
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
        ->getJson('/api/investigations')
        ->assertOk()
        ->assertJsonCount(3, 'data');
});

it('limits a portal user to their own client', function () {
    $client = Client::factory()->create();
    $own = Investigation::factory()->create(['client_id' => $client->id]);
    $other = Investigation::factory()->create();

    $response = $this->actingAs(portalUser($client))->getJson('/api/investigations')->assertOk();

    expect($response->json('data.*.id'))->toBe([$own->id]);

    $this->actingAs(portalUser($client))->getJson("/api/investigations/{$other->id}")->assertForbidden();
});

it('returns a matter payload shaped like the SPA types', function () {
    $matter = Investigation::factory()->create();

    $this->actingAs(investigator())
        ->getJson("/api/investigations/{$matter->id}")
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
    $allegation = Allegation::factory()->create();

    $this->actingAs(investigator())
        ->patchJson("/api/allegations/{$allegation->id}", ['finding' => 'substantiated', 'findingNotes' => 'Corroborated by two witnesses.'])
        ->assertOk()
        ->assertJsonPath('data.finding', 'substantiated');

    expect($allegation->refresh()->finding_notes)->toBe('Corroborated by two witnesses.');
});

it('blocks a portal user from recording findings', function () {
    $allegation = Allegation::factory()->create();

    $this->actingAs(portalUser(Client::factory()->create()))
        ->patchJson("/api/allegations/{$allegation->id}", ['finding' => 'substantiated'])
        ->assertForbidden();
});

it('stores and deletes a matter note', function () {
    $matter = Investigation::factory()->create();
    $user = investigator();

    $noteId = $this->actingAs($user)
        ->postJson("/api/investigations/{$matter->id}/notes", ['body' => 'Called HR for the roster.'])
        ->assertCreated()
        ->assertJsonPath('data.author', $user->name)
        ->json('data.id');

    $this->actingAs($user)->getJson("/api/investigations/{$matter->id}/notes")->assertJsonCount(1, 'data');
    $this->actingAs($user)->deleteJson("/api/notes/{$noteId}")->assertNoContent();
    $this->actingAs($user)->getJson("/api/investigations/{$matter->id}/notes")->assertJsonCount(0, 'data');
});

it('persists the report builder state', function () {
    $matter = Investigation::factory()->create();

    $this->actingAs(investigator())
        ->putJson("/api/investigations/{$matter->id}/report", [
            'status' => 'final',
            'title' => 'Final report',
            'includedSections' => ['summary' => true],
        ])
        ->assertSuccessful()
        ->assertJsonPath('data.status', 'final');

    $this->actingAs(investigator())
        ->getJson("/api/investigations/{$matter->id}/report")
        ->assertJsonPath('data.title', 'Final report')
        ->assertJsonPath('data.includedSections.summary', true);
});
