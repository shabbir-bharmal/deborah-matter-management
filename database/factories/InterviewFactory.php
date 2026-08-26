<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Witness;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<\App\Models\Interview>
 */
class InterviewFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // An interview always belongs to the same matter as its witness.
        $witness = Witness::factory()->create();

        return [
            'id' => 'int-'.Str::lower(Str::random(8)),
            'investigation_id' => $witness->investigation_id,
            'witness_id' => $witness->id,
            'interviewer_id' => User::factory(),
            'scheduled_at' => fake()->dateTimeBetween('-1 month', '+1 month'),
            'status' => 'scheduled',
            'notes' => fake()->sentence(),
            'transcript_excerpt' => [fake()->sentence()],
        ];
    }
}
