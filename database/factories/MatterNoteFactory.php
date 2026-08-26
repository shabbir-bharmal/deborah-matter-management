<?php

namespace Database\Factories;

use App\Models\Investigation;
use App\Models\MatterNote;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MatterNote>
 */
class MatterNoteFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'investigation_id' => Investigation::factory(),
            'user_id' => User::factory(),
            'author' => fake()->name(),
            'body' => fake()->paragraph(),
        ];
    }
}
