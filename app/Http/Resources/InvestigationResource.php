<?php

namespace App\Http\Resources;

use App\Models\Investigation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Investigation
 */
class InvestigationResource extends JsonResource
{
    /**
     * Mirrors the `Investigation` type in resources/js/src/types.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'referenceNumber' => $this->reference_number,
            'title' => $this->title,
            'client' => $this->client->name,
            'clientId' => $this->client_id,
            'clientSlug' => $this->client->slug,
            'type' => $this->type,
            'status' => $this->status,
            'priority' => $this->priority,
            'investigator' => $this->investigator?->name ?? 'Unassigned',
            'investigatorId' => $this->investigator_id,
            'openedAt' => $this->opened_at->format('Y-m-d'),
            'targetCompletionDate' => $this->target_completion_date->format('Y-m-d'),
            'completedAt' => $this->completed_at?->format('Y-m-d'),
            'description' => $this->description,
        ];
    }
}
