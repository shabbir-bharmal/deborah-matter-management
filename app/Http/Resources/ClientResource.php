<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Client
 */
class ClientResource extends JsonResource
{
    /**
     * `id` is the slug because the SPA routes clients by slug.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->slug,
            'clientId' => $this->getKey(),
            'name' => $this->name,
            'matterCount' => (int) ($this->investigations_count ?? 0),
            'activeCount' => (int) ($this->active_investigations_count ?? 0),
        ];
    }
}
