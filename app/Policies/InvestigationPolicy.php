<?php

namespace App\Policies;

use App\Models\Investigation;
use App\Models\User;

class InvestigationPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('investigations.view');
    }

    /**
     * Portal users only ever reach their own client's matters; staff see all.
     */
    public function view(User $user, Investigation $investigation): bool
    {
        if (! $user->can('investigations.view')) {
            return false;
        }

        return $user->client_id === null || $user->client_id === $investigation->client_id;
    }

    public function create(User $user): bool
    {
        return $user->can('investigations.create');
    }

    public function update(User $user, Investigation $investigation): bool
    {
        return $user->can('investigations.update') && $this->view($user, $investigation);
    }

    public function delete(User $user, Investigation $investigation): bool
    {
        return $user->can('investigations.delete') && $this->view($user, $investigation);
    }
}
