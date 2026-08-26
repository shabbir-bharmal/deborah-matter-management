<?php

namespace Database\Factories;

use App\Models\Investigation;
use App\Models\Witness;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Witness>
 */
class WitnessFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => 'wit-'.Str::lower(Str::random(8)),
            'investigation_id' => Investigation::factory(),
            'name' => fake()->name(),
            'role' => fake()->jobTitle(),
            'relationship' => fake()->randomElement(['complainant', 'respondent', 'coworker', 'manager', 'third_party']),
            'interview_status' => fake()->randomElement(['not_scheduled', 'scheduled', 'completed']),
            'interview_date' => null,
            'notes' => fake()->sentence(),
        ];
    }
}
