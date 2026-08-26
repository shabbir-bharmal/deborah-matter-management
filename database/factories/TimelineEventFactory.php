<?php

namespace Database\Factories;

use App\Models\Investigation;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<\App\Models\TimelineEvent>
 */
class TimelineEventFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => 'tl-'.Str::lower(Str::random(8)),
            'investigation_id' => Investigation::factory(),
            'date' => fake()->dateTimeBetween('-6 months'),
            'type' => fake()->randomElement(['intake', 'meeting', 'interview', 'evidence', 'review', 'milestone', 'correspondence']),
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(),
        ];
    }
}
