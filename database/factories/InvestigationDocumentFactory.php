<?php

namespace Database\Factories;

use App\Models\Investigation;
use App\Models\InvestigationDocument;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<InvestigationDocument>
 */
class InvestigationDocumentFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => 'doc-'.Str::lower(Str::random(8)),
            'investigation_id' => Investigation::factory(),
            'name' => fake()->sentence(3),
            'type' => fake()->randomElement(['report', 'plan', 'correspondence', 'consent_form', 'summary']),
            'status' => fake()->randomElement(['draft', 'final', 'shared']),
        ];
    }
}
