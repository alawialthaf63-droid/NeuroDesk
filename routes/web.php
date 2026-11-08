<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\WorkspaceSettingController;

// Halaman utama
Route::inertia('/', 'welcome')->name('home');

// Halaman yang membutuhkan autentikasi
Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard NeuroDesk
    Route::get('dashboard', [TaskController::class, 'index'])
        ->name('dashboard');

    // Pengaturan Ruang Kerja
    Route::put('workspace-settings', [WorkspaceSettingController::class, 'update'])
        ->name('workspace-settings.update');

    // Task Management
    Route::prefix('tasks')->name('tasks.')->group(function () {

        // Tambah task
        Route::post('/', [TaskController::class, 'store'])
            ->name('store');

        // Update task
        Route::put('/{task}', [TaskController::class, 'update'])
            ->name('update');

        // Hapus task
        Route::delete('/{task}', [TaskController::class, 'destroy'])
            ->name('destroy');

        // Toggle task selesai
        Route::patch('/{task}/toggle-complete', [
            TaskController::class,
            'toggleComplete'
        ])->name('toggle-complete');

    });

});

// Pengaturan Laravel
require __DIR__.'/settings.php';