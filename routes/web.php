<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

/**
 * Created this route If reload the any pages it will first loading with this route and then react router
 * So I have creted this pages
 */
Route::get('/investigations', function () {
    return Inertia::render('investigations');
})->name('investigations');

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

Route::get('/investigations/{id}/{subpage}', function ($id, $subpage) {
    return Inertia::render('investigation/subpage', ['id' => $id, 'subpage' => $subpage]);
})->name('investigations');

// Route::middleware(['auth'])->group(function () {
//     Route::get('dashboard', function () {
//         return Inertia::render('dashboard');
//     })->name('dashboard');
// });

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
