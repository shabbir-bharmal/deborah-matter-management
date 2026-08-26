<?php

namespace App\Http\Resources;

use App\Models\Evidence;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Evidence
 */
class EvidenceResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'investigationId' => $this->investigation_id,
            'title' => $this->title,
            'type' => $this->type,
            'source' => $this->source,
            'date' => $this->date->format('Y-m-d'),
            'status' => $this->status,
            'description' => $this->description,
            'metadata' => (object) ($this->metadata ?? []),
            'relatedAllegationIds' => $this->allegationIds('related'),
            'supportsAllegations' => $this->allegationIds('supports'),
            'contradictsAllegations' => $this->allegationIds('contradicts'),
        ];
    }

    /**
     * @return list<string>
     */
    private function allegationIds(string $relation): array
    {
        if (! $this->relationLoaded('allegations')) {
            return [];
        }

        return $this->allegations
            ->where('pivot.relation', $relation)
            ->pluck('id')
            ->values()
            ->all();
    }
}
