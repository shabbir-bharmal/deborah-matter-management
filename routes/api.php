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
    Route::post('clients', [ClientController::class, 'store'])->middleware('can:clients.create');
    Route::put('clients/{client}', [ClientController::class, 'update'])->middleware('can:clients.update');
    Route::delete('clients/{client}', [ClientController::class, 'destroy'])->middleware('can:clients.delete');
    Route::get('clients/{client}', [ClientController::class, 'show'])->middleware('can:clients.view');

    Route::get('matters', [InvestigationController::class, 'index'])->middleware('can:viewAny,'.Investigation::class);
    Route::post('matters', [InvestigationController::class, 'store'])->middleware('can:create,'.Investigation::class);

    Route::put('matters/{investigation}', [InvestigationController::class, 'update'])->middleware('can:update,investigation');
    Route::delete('matters/{investigation}', [InvestigationController::class, 'destroy'])->middleware('can:delete,investigation');

    /**
     * Everything below hangs off one matter: `can:view,investigation` enforces
     * both the permission and the client-portal scoping in one place.
     */
    Route::middleware('can:view,investigation')->prefix('matters/{investigation}')->group(function () {
        Route::get('/', [InvestigationController::class, 'show']);

        // Allegations
        Route::get('allegations', [AllegationController::class, 'index'])->middleware('permission:allegations.view');
        Route::post('allegations', [AllegationController::class, 'store'])->middleware('permission:allegations.create');
        Route::put('allegations/{allegation}', [AllegationController::class, 'update'])->middleware('permission:allegations.update');
        Route::delete('allegations/{allegation}', [AllegationController::class, 'destroy'])->middleware('permission:allegations.delete');

        // Witnesses
        Route::get('witnesses', [WitnessController::class, 'index'])->middleware('permission:witnesses.view');
        Route::post('witnesses', [WitnessController::class, 'store'])->middleware('permission:witnesses.create');
        Route::put('witnesses/{witness}', [WitnessController::class, 'update'])->middleware('permission:witnesses.update');
        Route::delete('witnesses/{witness}', [WitnessController::class, 'destroy'])->middleware('permission:witnesses.delete');

        // Interviews
        Route::get('interviews', [InterviewController::class, 'index'])->middleware('permission:interviews.view');
        Route::post('interviews', [InterviewController::class, 'store'])->middleware('permission:interviews.create');
        Route::put('interviews/{interview}', [InterviewController::class, 'update'])->middleware('permission:interviews.update');
        Route::delete('interviews/{interview}', [InterviewController::class, 'destroy'])->middleware('permission:interviews.delete');

        // Evidence
        Route::get('evidence', [EvidenceController::class, 'index'])->middleware('permission:evidence.view');
        Route::post('evidence', [EvidenceController::class, 'store'])->middleware('permission:evidence.create');
        Route::put('evidence/{evidence}', [EvidenceController::class, 'update'])->middleware('permission:evidence.update');
        Route::delete('evidence/{evidence}', [EvidenceController::class, 'destroy'])->middleware('permission:evidence.delete');

        // Timeline events
        Route::get('timeline-events', [TimelineEventController::class, 'index'])->middleware('permission:timeline.view');
        Route::post('timeline-events', [TimelineEventController::class, 'store'])->middleware('permission:timeline.create');
        Route::put('timeline-events/{timelineEvent}', [TimelineEventController::class, 'update'])->middleware('permission:timeline.update');
        Route::delete('timeline-events/{timelineEvent}', [TimelineEventController::class, 'destroy'])->middleware('permission:timeline.delete');

        // Documents
        Route::get('documents', [DocumentController::class, 'index'])->middleware('permission:documents.view');
        Route::post('documents', [DocumentController::class, 'store'])->middleware('permission:documents.create');
        Route::put('documents/{document}', [DocumentController::class, 'update'])->middleware('permission:documents.update');
        Route::delete('documents/{document}', [DocumentController::class, 'destroy'])->middleware('permission:documents.delete');

        // Notes
        Route::get('notes', [NoteController::class, 'index'])->middleware('permission:notes.view');
        Route::post('notes', [NoteController::class, 'store'])->middleware('permission:notes.create');
        Route::put('notes/{note}', [NoteController::class, 'update'])->middleware('permission:notes.update');
        Route::delete('notes/{note}', [NoteController::class, 'destroy'])->middleware('permission:notes.delete');

        Route::get('report', [ReportController::class, 'show'])->middleware('permission:reports.view');
        Route::put('report', [ReportController::class, 'update'])->middleware('permission:reports.update');
    });

    // Administration — user accounts and the role/permission matrix.
    Route::get('users', [UserController::class, 'index'])->middleware('can:users.view');
    Route::get('users/assignable', [UserController::class, 'assignable'])->middleware('can:investigations.create');
    Route::post('users', [UserController::class, 'store'])->middleware('can:users.create');
    Route::patch('users/{user}', [UserController::class, 'update'])->middleware('can:users.update');
    Route::delete('users/{user}', [UserController::class, 'destroy'])->middleware('can:users.delete');

    Route::get('roles', [RoleController::class, 'index'])->middleware('can:roles.view');
    Route::put('roles/{role}', [RoleController::class, 'update'])->middleware('can:roles.update');

});
