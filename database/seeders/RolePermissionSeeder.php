<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /**
     * Every ability the UI gates on, grouped by module.
     *
     * @var array<string, list<string>>
     */
    public const ABILITIES = [
        'dashboard' => ['view'],
        'investigations' => ['view', 'create', 'update', 'delete'],
        'allegations' => ['view', 'create', 'update', 'delete'],
        'witnesses' => ['view', 'create', 'update', 'delete'],
        'interviews' => ['view', 'create', 'update', 'delete'],
        'evidence' => ['view', 'create', 'update', 'delete'],
        'timeline' => ['view', 'create', 'update', 'delete'],
        'findings' => ['view', 'update'],
        'documents' => ['view', 'create', 'update', 'delete'],
        'reports' => ['view', 'update', 'finalise'],
        'notes' => ['view', 'create', 'delete'],
        'clients' => ['view', 'create', 'update', 'delete'],
        'calendar' => ['view'],
        'users' => ['view', 'create', 'update', 'delete'],
        'roles' => ['view', 'update'],
        'settings' => ['view'],
    ];

    /**
     * Abilities granted to each non-admin role. Admin gets everything.
     *
     * @var array<string, list<string>>
     */
    public const ROLES = [
        'investigator' => [
            'dashboard.view',
            'investigations.view', 'investigations.create', 'investigations.update',
            'allegations.view', 'allegations.create', 'allegations.update', 'allegations.delete',
            'witnesses.view', 'witnesses.create', 'witnesses.update', 'witnesses.delete',
            'interviews.view', 'interviews.create', 'interviews.update', 'interviews.delete',
            'evidence.view', 'evidence.create', 'evidence.update', 'evidence.delete',
            'timeline.view', 'timeline.create', 'timeline.update', 'timeline.delete',
            'findings.view', 'findings.update',
            'documents.view', 'documents.create', 'documents.update', 'documents.delete',
            'reports.view', 'reports.update', 'reports.finalise',
            'notes.view', 'notes.create', 'notes.delete',
            'clients.view',
            'calendar.view',
            'settings.view',
        ],
        'client' => [
            'investigations.view',
            'documents.view',
            'reports.view',
            'calendar.view',
            'settings.view',
        ],
    ];

    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (self::ABILITIES as $module => $actions) {
            foreach ($actions as $action) {
                Permission::findOrCreate("{$module}.{$action}");
            }
        }

        Role::findOrCreate('admin')->syncPermissions(Permission::all());

        foreach (self::ROLES as $role => $abilities) {
            Role::findOrCreate($role)->syncPermissions($abilities);
        }
    }
}
