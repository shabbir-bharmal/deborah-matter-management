<?php

namespace Database\Factories;

use App\Models\Evidence;
use App\Models\Investigation;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Evidence>
 */
class EvidenceFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => 'evd-'.Str::lower(Str::random(8)),
            'investigation_id' => Investigation::factory(),
            'title' => fake()->sentence(4),
            'type' => fake()->randomElement(['email', 'document', 'chat_log', 'recording', 'photo', 'system_report']),
            'source' => fake()->company(),
            'date' => fake()->dateTimeBetween('-6 months'),
            'status' => fake()->randomElement(['received', 'in_review', 'reviewed', 'archived']),
            'description' => fake()->paragraph(),
            'metadata' => ['Source' => fake()->word()],
        ];
    }
}
