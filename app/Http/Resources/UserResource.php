<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * The SPA gates its navigation and actions on `permissions`, so they ship with
 * the authenticated user rather than through a separate request.
 *
 * @mixin User
 */
class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'avatar' => $this->avatar,
            'avatarUrl' => $this->avatar ? Storage::url($this->avatar) : null,
            'clientId' => $this->client_id,
            'clientSlug' => $this->client?->slug,
            'roles' => $this->getRoleNames()->values(),
            'permissions' => $this->getAllPermissions()->pluck('name')->values(),
        ];
    }
}
