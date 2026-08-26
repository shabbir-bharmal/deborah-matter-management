<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Witness
 */
class WitnessResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'investigationId' => $this->investigation_id,
            'name' => $this->name,
            'role' => $this->role,
            'relationship' => $this->relationship,
            'interviewStatus' => $this->interview_status,
            'interviewDate' => $this->interview_date?->format('Y-m-d'),
            'notes' => $this->notes,
        ];
    }
}
