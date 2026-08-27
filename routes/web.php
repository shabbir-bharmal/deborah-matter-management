<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/', function () {
    return Inertia::render('dashboard');
})->middleware(['auth'])->name('dashboard');

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

Route::get('/matters/{id}', function ($id) {
    return Inertia::render('matter', ['id' => $id]);
})->name('matters');

// Legacy matter URLs — keep old links/bookmarks working.
Route::redirect('/investigations', '/matters', 301);
Route::redirect('/investigations/{any}', '/matters/{any}', 301);

/**
 * Admin routes define here
 */


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
