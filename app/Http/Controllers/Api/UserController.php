<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return UserResource::collection(User::with(['client', 'roles'])->orderBy('name')->get());
    }

    /**
     * Staff users who can be assigned as the investigator on a matter. Anyone
     * with investigator or admin role is eligible, regardless of client scope.
     */
    public function assignable(): AnonymousResourceCollection
    {
        $users = User::with('roles')
            ->whereHas('roles', fn ($query) => $query->whereIn('name', ['investigator', 'admin']))
            ->orderBy('name')
            ->get();

        return UserResource::collection($users);
    }

    public function store(Request $request): UserResource
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', Rule::exists('roles', 'name')],
            'clientId' => ['nullable', Rule::exists('clients', 'id')],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'client_id' => $data['clientId'] ?? null,
            'email_verified_at' => now(),
        ]);

        $user->syncRoles($data['role']);

        return new UserResource($user->load('client'));
    }

    public function update(Request $request, User $user): UserResource
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user)],
            'password' => ['sometimes', 'nullable', 'string', 'min:8'],
            'role' => ['sometimes', Rule::exists('roles', 'name')],
            'clientId' => ['sometimes', 'nullable', Rule::exists('clients', 'id')],
        ]);

        $user->fill(array_filter([
            'name' => $data['name'] ?? null,
            'email' => $data['email'] ?? null,
            'password' => $data['password'] ?? null,
        ]));

        if (array_key_exists('clientId', $data)) {
            $user->client_id = $data['clientId'];
        }

        $user->save();

        if (isset($data['role'])) {
            $user->syncRoles($data['role']);
        }

        return new UserResource($user->fresh()->load('client'));
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        abort_if($request->user()->is($user), 422, 'You cannot delete your own account.');

        $user->delete();

        return response()->json(status: 204);
    }
}
