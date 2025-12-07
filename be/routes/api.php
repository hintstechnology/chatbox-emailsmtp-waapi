<?php

use App\Http\Controllers\Api\SessionController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\AdminController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Session routes
    Route::post('/sessions', [SessionController::class, 'store']);
    Route::get('/sessions', [SessionController::class, 'index']);

    // Message routes
    Route::post('/messages', [MessageController::class, 'store']);
    Route::get('/messages/{sessionId}', [MessageController::class, 'show']);

    // Admin routes
    Route::prefix('admin')->group(function () {
        Route::get('/sessions', [AdminController::class, 'sessions']);
        Route::post('/reply', [AdminController::class, 'reply']);
        Route::post('/finish-session', [AdminController::class, 'finishSession']);
    });
});

