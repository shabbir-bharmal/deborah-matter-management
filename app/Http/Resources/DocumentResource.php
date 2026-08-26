<?php

namespace App\Http\Resources;

use App\Models\InvestigationDocument;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin InvestigationDocument
 */
class DocumentResource extends JsonResource
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
            'type' => $this->type,
            'status' => $this->status,
            'createdAt' => $this->created_at->format('Y-m-d'),
        ];
    }
}
