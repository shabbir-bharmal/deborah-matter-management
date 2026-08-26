<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\Investigation;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Investigation>
 */
class InvestigationFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $openedAt = fake()->dateTimeBetween('-6 months', '-1 month');

        return [
            'id' => 'inv-'.Str::lower(Str::random(8)),
            'reference_number' => 'INV-'.fake()->unique()->numberBetween(1000, 9999),
            'title' => fake()->sentence(4),
            'client_id' => Client::factory(),
            'investigator_id' => User::factory(),
            'type' => fake()->randomElement(['harassment', 'discrimination', 'misconduct', 'fraud']),
            'status' => fake()->randomElement(['open', 'in_progress', 'review', 'completed', 'closed']),
            'priority' => fake()->randomElement(['low', 'medium', 'high', 'critical']),
            'opened_at' => $openedAt,
            'target_completion_date' => fake()->dateTimeBetween($openedAt, '+3 months'),
            'description' => fake()->paragraph(),
        ];
    }

    public function active(): static
    {
        return $this->state(['status' => 'in_progress']);
    }
}
