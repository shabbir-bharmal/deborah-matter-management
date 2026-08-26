<?php

use App\Http\Controllers\Api\AllegationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CalendarController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\EvidenceController;
use App\Http\Controllers\Api\InterviewController;
use App\Http\Controllers\Api\InvestigationController;
use App\Http\Controllers\Api\NoteController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\TimelineEventController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WitnessController;
use App\Models\Investigation;
use Illuminate\Support\Facades\Route;

Route::post('login', [AuthController::class, 'login'])->middleware('guest')->name('api.login');

Route::middleware('auth')->group(function () {
    Route::get('user', [AuthController::class, 'user'])->name('api.user');
    Route::post('logout', [AuthController::class, 'logout'])->name('api.logout');

    Route::get('dashboard', DashboardController::class)->middleware('can:dashboard.view');
    Route::get('calendar', CalendarController::class)->middleware('can:calendar.view');
    Route::get('notifications', NotificationController::class);

    Route::get('clients', [ClientController::class, 'index'])->middleware('can:clients.view');
    Route::get('clients/{client}', [ClientController::class, 'show'])->middleware('can:clients.view');

    Route::get('matters', [InvestigationController::class, 'index'])->middleware('can:viewAny,'.Investigation::class);

    /**
     * Everything below hangs off one matter: `can:view,investigation` enforces
     * both the permission and the client-portal scoping in one place.
     */
    Route::middleware('can:view,investigation')->prefix('matters/{investigation}')->group(function () {
        Route::get('/', [InvestigationController::class, 'show']);
        Route::get('allegations', [AllegationController::class, 'index'])->middleware('can:allegations.view');
        Route::get('witnesses', [WitnessController::class, 'index'])->middleware('can:witnesses.view');
        Route::get('interviews', [InterviewController::class, 'index'])->middleware('can:interviews.view');
        Route::get('evidence', [EvidenceController::class, 'index'])->middleware('can:evidence.view');
        Route::get('timeline-events', [TimelineEventController::class, 'index'])->middleware('can:timeline.view');
        Route::get('documents', [DocumentController::class, 'index'])->middleware('can:documents.view');

        Route::get('notes', [NoteController::class, 'index'])->middleware('can:notes.view');
        Route::post('notes', [NoteController::class, 'store'])->middleware('can:notes.create');

        Route::get('report', [ReportController::class, 'show'])->middleware('can:reports.view');
        Route::put('report', [ReportController::class, 'update'])->middleware('can:reports.update');
    });

    // Administration — user accounts and the role/permission matrix.
    Route::get('users', [UserController::class, 'index'])->middleware('can:users.view');
    Route::post('users', [UserController::class, 'store'])->middleware('can:users.create');
    Route::patch('users/{user}', [UserController::class, 'update'])->middleware('can:users.update');
    Route::delete('users/{user}', [UserController::class, 'destroy'])->middleware('can:users.delete');

    Route::get('roles', [RoleController::class, 'index'])->middleware('can:roles.view');
    Route::put('roles/{role}', [RoleController::class, 'update'])->middleware('can:roles.update');

    Route::patch('allegations/{allegation}', [AllegationController::class, 'update'])->middleware('can:findings.update');
    Route::delete('notes/{note}', [NoteController::class, 'destroy'])->middleware('can:notes.delete');
});
