<?php

namespace App\Http\Resources;

use App\Models\TimelineEvent;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin TimelineEvent
 */
class TimelineEventResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'investigationId' => $this->investigation_id,
            'date' => $this->date->format('Y-m-d'),
            'type' => $this->type,
            'title' => $this->title,
            'description' => $this->description,
            'relatedEntity' => $this->when((bool) $this->related_entity_type, fn () => [
                'type' => $this->related_entity_type,
                'id' => $this->related_entity_id,
                'label' => $this->related_entity_label,
            ]),
        ];
    }
}
