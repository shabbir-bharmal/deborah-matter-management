<?php

namespace Database\Factories;

use App\Models\Investigation;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<\App\Models\Allegation>
 */
class AllegationFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => 'alg-'.Str::lower(Str::random(8)),
            'investigation_id' => Investigation::factory(),
            'title' => fake()->sentence(5),
            'description' => fake()->paragraph(),
            'category' => fake()->randomElement(['harassment', 'discrimination', 'misconduct', 'retaliation']),
            'status' => 'under_review',
            'finding' => null,
            'finding_notes' => null,
        ];
    }
}
