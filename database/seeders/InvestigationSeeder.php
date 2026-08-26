<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Loads the curated demo matters exported from the prototype's mock datasets.
 * Regenerate the JSON with `node scripts/dump-mock-data.mjs`.
 */
class InvestigationSeeder extends Seeder
{
    private const STAFF_DOMAIN = 'investigations.test';

    /** @var array<string, int> name => user id */
    private array $staff = [];

    /** @var array<string, int> slug => client id */
    private array $clients = [];

    public function run(): void
    {
        $investigations = $this->load('investigations');
        $witnesses = $this->load('witnesses');
        $allegations = $this->load('allegations');
        $evidence = $this->load('evidence');
        $interviews = $this->load('interviews');
        $timeline = $this->load('timeline-events');
        $documents = $this->load('documents');

        $now = Carbon::now();

        $this->seedClients($investigations);
        $this->seedStaff($investigations, $interviews);

        DB::table('investigations')->insert(array_map(fn (array $row): array => [
            'id' => $row['id'],
            'reference_number' => $row['referenceNumber'],
            'title' => $row['title'],
            'client_id' => $this->clients[Str::slug($row['client'])],
            'investigator_id' => $this->staff[$row['investigator']] ?? null,
            'type' => $row['type'],
            'status' => $row['status'],
            'priority' => $row['priority'],
            'opened_at' => $row['openedAt'],
            'target_completion_date' => $row['targetCompletionDate'],
            'completed_at' => $row['completedAt'] ?? null,
            'description' => $row['description'],
            'created_at' => $now,
            'updated_at' => $now,
        ], $investigations));

        DB::table('witnesses')->insert(array_map(fn (array $row): array => [
            'id' => $row['id'],
            'investigation_id' => $row['investigationId'],
            'name' => $row['name'],
            'role' => $row['role'],
            'relationship' => $row['relationship'],
            'interview_status' => $row['interviewStatus'],
            'interview_date' => $row['interviewDate'] ?? null,
            'notes' => $row['notes'] ?? null,
            'created_at' => $now,
            'updated_at' => $now,
        ], $witnesses));

        DB::table('allegations')->insert(array_map(fn (array $row): array => [
            'id' => $row['id'],
            'investigation_id' => $row['investigationId'],
            'title' => $row['title'],
            'description' => $row['description'],
            'category' => $row['category'],
            'status' => $row['status'],
            'finding' => $row['finding'] ?? null,
            'finding_notes' => null,
            'created_at' => $now,
            'updated_at' => $now,
        ], $allegations));

        DB::table('evidence')->insert(array_map(fn (array $row): array => [
            'id' => $row['id'],
            'investigation_id' => $row['investigationId'],
            'title' => $row['title'],
            'type' => $row['type'],
            'source' => $row['source'],
            'date' => $row['date'],
            'status' => $row['status'],
            'description' => $row['description'],
            'metadata' => json_encode($row['metadata'] ?? []),
            'created_at' => $now,
            'updated_at' => $now,
        ], $evidence));

        DB::table('interviews')->insert(array_map(fn (array $row): array => [
            'id' => $row['id'],
            'investigation_id' => $row['investigationId'],
            'witness_id' => $row['witnessId'],
            'interviewer_id' => $this->staff[$row['interviewer']] ?? null,
            'scheduled_at' => Carbon::parse($row['scheduledAt']),
            'status' => $row['status'],
            'notes' => $row['notes'] ?? null,
            'transcript_excerpt' => isset($row['transcriptExcerpt']) ? json_encode($row['transcriptExcerpt']) : null,
            'created_at' => $now,
            'updated_at' => $now,
        ], $interviews));

        foreach (array_chunk($timeline, 200) as $chunk) {
            DB::table('timeline_events')->insert(array_map(fn (array $row): array => [
                'id' => $row['id'],
                'investigation_id' => $row['investigationId'],
                'date' => $row['date'],
                'type' => $row['type'],
                'title' => $row['title'],
                'description' => $row['description'],
                'related_entity_type' => $row['relatedEntity']['type'] ?? null,
                'related_entity_id' => $row['relatedEntity']['id'] ?? null,
                'related_entity_label' => $row['relatedEntity']['label'] ?? null,
                'created_at' => $now,
                'updated_at' => $now,
            ], $chunk));
        }

        DB::table('investigation_documents')->insert(array_map(fn (array $row): array => [
            'id' => $row['id'],
            'investigation_id' => $row['investigationId'],
            'name' => $row['name'],
            'type' => $row['type'],
            'status' => $row['status'],
            'created_at' => $row['createdAt'],
            'updated_at' => $row['createdAt'],
        ], $documents));

        $this->seedPivots($allegations, $evidence, $interviews, $witnesses);
    }

    /**
     * @param  list<array<string, mixed>>  $investigations
     */
    private function seedClients(array $investigations): void
    {
        $names = array_values(array_unique(array_column($investigations, 'client')));

        foreach ($names as $name) {
            $slug = Str::slug($name);
            $this->clients[$slug] = DB::table('clients')->insertGetId([
                'name' => $name,
                'slug' => $slug,
                'contact_email' => 'contact@'.$slug.'.test',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Investigators and interviewers exist only as names in the mock data, so
     * each distinct name becomes an investigator account.
     *
     * @param  list<array<string, mixed>>  $investigations
     * @param  list<array<string, mixed>>  $interviews
     */
    private function seedStaff(array $investigations, array $interviews): void
    {
        $names = array_values(array_unique(array_merge(
            array_column($investigations, 'investigator'),
            array_column($interviews, 'interviewer'),
        )));

        foreach ($names as $name) {
            $id = DB::table('users')->insertGetId([
                'name' => $name,
                'email' => Str::slug($name, '.').'@'.self::STAFF_DOMAIN,
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $this->staff[$name] = $id;
        }

        DB::table('model_has_roles')->insert(array_map(fn (int $id): array => [
            'role_id' => DB::table('roles')->where('name', 'investigator')->value('id'),
            'model_type' => \App\Models\User::class,
            'model_id' => $id,
        ], array_values($this->staff)));
    }

    /**
     * @param  list<array<string, mixed>>  $allegations
     * @param  list<array<string, mixed>>  $evidence
     * @param  list<array<string, mixed>>  $interviews
     * @param  list<array<string, mixed>>  $witnesses
     */
    private function seedPivots(array $allegations, array $evidence, array $interviews, array $witnesses): void
    {
        $allegationIds = array_flip(array_column($allegations, 'id'));
        $evidenceIds = array_flip(array_column($evidence, 'id'));
        $witnessIds = array_flip(array_column($witnesses, 'id'));

        $allegationWitness = [];
        foreach ($allegations as $allegation) {
            foreach ($allegation['relatedWitnessIds'] ?? [] as $witnessId) {
                if (isset($witnessIds[$witnessId])) {
                    $allegationWitness["{$allegation['id']}|{$witnessId}"] = [
                        'allegation_id' => $allegation['id'],
                        'witness_id' => $witnessId,
                    ];
                }
            }
        }

        // `related` links are declared from both sides in the mock data; keyed
        // inserts collapse the duplicates.
        $allegationEvidence = [];
        $link = function (string $evidenceId, string $allegationId, string $relation) use (&$allegationEvidence, $allegationIds): void {
            if (isset($allegationIds[$allegationId])) {
                $allegationEvidence["{$evidenceId}|{$allegationId}|{$relation}"] = [
                    'evidence_id' => $evidenceId,
                    'allegation_id' => $allegationId,
                    'relation' => $relation,
                ];
            }
        };

        foreach ($allegations as $allegation) {
            foreach ($allegation['relatedEvidenceIds'] ?? [] as $evidenceId) {
                if (isset($evidenceIds[$evidenceId])) {
                    $link($evidenceId, $allegation['id'], 'related');
                }
            }
        }

        foreach ($evidence as $item) {
            foreach ($item['relatedAllegationIds'] ?? [] as $allegationId) {
                $link($item['id'], $allegationId, 'related');
            }
            foreach ($item['supportsAllegations'] ?? [] as $allegationId) {
                $link($item['id'], $allegationId, 'supports');
            }
            foreach ($item['contradictsAllegations'] ?? [] as $allegationId) {
                $link($item['id'], $allegationId, 'contradicts');
            }
        }

        $allegationInterview = [];
        foreach ($interviews as $interview) {
            foreach ($interview['relatedAllegationIds'] ?? [] as $allegationId) {
                if (isset($allegationIds[$allegationId])) {
                    $allegationInterview["{$interview['id']}|{$allegationId}"] = [
                        'interview_id' => $interview['id'],
                        'allegation_id' => $allegationId,
                    ];
                }
            }
        }

        foreach (['allegation_witness' => $allegationWitness, 'allegation_evidence' => $allegationEvidence, 'allegation_interview' => $allegationInterview] as $table => $rows) {
            foreach (array_chunk(array_values($rows), 200) as $chunk) {
                DB::table($table)->insert($chunk);
            }
        }
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function load(string $name): array
    {
        $path = database_path("seeders/data/{$name}.json");

        if (! is_file($path)) {
            throw new RuntimeException("Missing seed data: {$path}. Run `node scripts/dump-mock-data.mjs`.");
        }

        return json_decode((string) file_get_contents($path), true, flags: JSON_THROW_ON_ERROR);
    }
}
