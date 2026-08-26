<?php

namespace Database\Factories;

use App\Models\Investigation;
use App\Models\InvestigationReport;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InvestigationReport>
 */
class InvestigationReportFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'investigation_id' => Investigation::factory(),
            'status' => 'draft',
            'title' => fake()->sentence(4),
            'executive_summary' => fake()->paragraph(),
            'included_sections' => [],
            'auto_fill' => [],
            'custom_sections' => [],
        ];
    }
}
