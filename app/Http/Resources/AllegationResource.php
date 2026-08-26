<?php

namespace App\Http\Resources;

use App\Models\Allegation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Allegation
 */
class AllegationResource extends JsonResource
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
            'description' => $this->description,
            'category' => $this->category,
            'status' => $this->status,
            'finding' => $this->finding,
            'findingNotes' => $this->finding_notes,
            'relatedWitnessIds' => $this->whenLoaded('witnesses', fn () => $this->witnesses->pluck('id'), []),
            'relatedEvidenceIds' => $this->whenLoaded(
                'evidence',
                fn () => $this->evidence->where('pivot.relation', 'related')->pluck('id')->values(),
                [],
            ),
        ];
    }
}
