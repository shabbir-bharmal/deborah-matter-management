<?php

namespace App\Http\Resources;

use App\Models\MatterNote;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin MatterNote
 */
class NoteResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'investigationId' => $this->investigation_id,
            'author' => $this->author,
            'body' => $this->body,
            'createdAt' => $this->created_at->toIso8601String(),
        ];
    }
}
