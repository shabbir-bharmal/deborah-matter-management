<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/dashboard', function () {
    return Inertia::render('dashboard');
})->name('dashboard');

/**
 * Created this route If reload the any pages it will first loading with this route and then react router
 * So I have creted this pages
 */
Route::get('/matters', function () {
    return Inertia::render('matters');
})->name('matters');

Route::get('/clients', function () {
    return Inertia::render('clients');
})->name('clients');

Route::get('/clients/{name}', function ($name) {
    return Inertia::render('clients/name', ['name' => $name]);
})->name('clients');

Route::get('/calendar', function () {
    return Inertia::render('calendar');
})->name('calendar');

Route::get('/display-calendar', function () {
    return Inertia::render('display-calendar');
})->name('display-calendar');

Route::get('/settings', function () {
    return Inertia::render('settings');
})->name('settings');

Route::get('/matters/{id}/{subpage}', function ($id, $subpage) {
    return Inertia::render('matter/subpage', ['id' => $id, 'subpage' => $subpage]);
})->name('matters');

// Legacy matter URLs — keep old links/bookmarks working.
Route::redirect('/investigations', '/matters', 301);
Route::redirect('/investigations/{any}', '/matters/{any}', 301);

/**
 * Admin routes define here
 */

Route::group(['prefix' => 'admin', 'as' => 'admin.'], function () {

    Route::get('/', function () {
        return Inertia::render('admin/login');
    })->name('admin');

    Route::get('/dashboard', function () {
        return Inertia::render('admin/dashboard');
    })->name('dashboard');

    Route::get('/intakes', function () {
        return Inertia::render('admin/intakes');
    })->name('intakes');

    Route::get('/intakes/new', function () {
        return Inertia::render('admin/intakes/new');
    })->name('intakes.new');

    Route::get('/intakes/{id}', function ($id) {
        return Inertia::render('admin/intakes/id', ['id' => $id]);
    })->name('intakes.show');

    Route::get('/matters', function () {
        return Inertia::render('admin/matters');
    })->name('matters');

    Route::get('/matters/{id}', function ($id) {
        return Inertia::render('admin/matters/id', ['id' => $id]);
    })->name('matters.show');

    Route::get('/search', function () {
        return Inertia::render('admin/search');
    })->name('search');

    Route::get('/calendar', function () {
        return Inertia::render('admin/calendar');
    })->name('calendar');

    Route::get('/tasks', function () {
        return Inertia::render('admin/tasks');
    })->name('tasks');

    Route::get('/documents', function () {
        return Inertia::render('admin/documents');
    })->name('documents');

    Route::get('/reports', function () {
        return Inertia::render('admin/reports');
    })->name('reports');

    Route::get('/administration', function () {
        return Inertia::render('admin/administration');
    })->name('administration');
});

// Route::middleware(['auth'])->group(function () {
//     Route::get('dashboard', function () {
//         return Inertia::render('dashboard');
//     })->name('dashboard');
// });

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
