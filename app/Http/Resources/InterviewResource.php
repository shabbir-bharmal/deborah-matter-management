<?php

namespace App\Http\Resources;

use App\Models\Interview;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Always carries the witness name/role — the SPA consumes this as
 * `InterviewWithWitness` everywhere it renders an interview.
 *
 * @mixin Interview
 */
class InterviewResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'investigationId' => $this->investigation_id,
            'witnessId' => $this->witness_id,
            'witnessName' => $this->witness?->name ?? 'Unknown witness',
            'witnessRole' => $this->witness?->role ?? '',
            'scheduledAt' => $this->scheduled_at->format('Y-m-d\TH:i:s'),
            'status' => $this->status,
            'interviewer' => $this->interviewer?->name ?? 'Unassigned',
            'notes' => $this->notes,
            'transcriptExcerpt' => $this->transcript_excerpt,
            'relatedAllegationIds' => $this->whenLoaded('allegations', fn () => $this->allegations->pluck('id'), []),
        ];
    }
}
