<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    /**
     * Roles with their granted abilities, plus the full ability catalogue the
     * admin screen renders as a matrix.
     */
    public function index(): JsonResponse
    {
        $roles = Role::with('permissions')->orderBy('name')->get();

        return response()->json([
            'data' => [
                'roles' => $roles->map(fn (Role $role): array => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'permissions' => $role->permissions->pluck('name')->values(),
                    'userCount' => $role->users()->count(),
                ]),
                'permissions' => Permission::orderBy('name')->pluck('name')->values(),
            ],
        ]);
    }

    public function update(Request $request, Role $role): JsonResponse
    {
        $data = $request->validate([
            'permissions' => ['required', 'array'],
            'permissions.*' => [Rule::exists('permissions', 'name')],
        ]);

        $role->syncPermissions($data['permissions']);

        return response()->json([
            'data' => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions()->pluck('name')->values(),
                'userCount' => $role->users()->count(),
            ],
        ]);
    }

    public function permissions(): JsonResponse
    {
        return response()->json([
            'data' => Permission::orderBy('name')->get()->map(fn (Permission $permission): array => [
                'id' => $permission->id,
                'name' => $permission->name,
                'module' => str($permission->name)->before('.')->toString(),
                'action' => str($permission->name)->after('.')->toString(),
                'roles' => $permission->roles()->orderBy('name')->pluck('name')->values(),
            ]),
        ]);
    }

    public function storePermission(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'regex:/^[a-z0-9_]+\.[a-z0-9_]+$/', 'unique:permissions,name'],
        ]);

        $permission = Permission::findOrCreate($data['name']);

        return response()->json([
            'data' => [
                'id' => $permission->id,
                'name' => $permission->name,
                'module' => str($permission->name)->before('.')->toString(),
                'action' => str($permission->name)->after('.')->toString(),
                'roles' => [],
            ],
        ], 201);
    }

    public function updatePermission(Request $request, Permission $permission): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'regex:/^[a-z0-9_]+\.[a-z0-9_]+$/', Rule::unique('permissions', 'name')->ignore($permission->id)],
        ]);

        $permission->update(['name' => $data['name']]);

        return response()->json([
            'data' => [
                'id' => $permission->id,
                'name' => $permission->name,
                'module' => str($permission->name)->before('.')->toString(),
                'action' => str($permission->name)->after('.')->toString(),
                'roles' => $permission->roles()->orderBy('name')->pluck('name')->values(),
            ],
        ]);
    }

    public function destroyPermission(Permission $permission): Response
    {
        $permission->roles()->detach();
        $permission->delete();

        return response()->noContent();
    }
}
