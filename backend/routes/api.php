<?php

use App\Http\Controllers\ActiviteController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AdminStatsController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AvisController;
use App\Http\Controllers\BilletController;
use App\Http\Controllers\CategorieController;
use App\Http\Controllers\DisponibiliteController;
use App\Http\Controllers\DocumentOperateurController;
use App\Http\Controllers\FavoriController;
use App\Http\Controllers\LangueController;
use App\Http\Controllers\PhotoActiviteController;
use App\Http\Controllers\QuestionnaireEcoController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VilleController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->middleware('signed')
    ->name('verification.verify');
Route::post('/email/verification-notification', [AuthController::class, 'resendVerificationEmail']);

Route::get('/users', [UserController::class, 'index'])->middleware('auth:sanctum');
Route::put('/users/{id}', [UserController::class, 'update'])->middleware('auth:sanctum');
Route::put('/users/{id}/password', [UserController::class, 'updatePassword'])->middleware('auth:sanctum');

Route::get('/admin/stats/dashboard', [AdminStatsController::class, 'dashboard'])->middleware('auth:sanctum');

Route::put('/admin/users/{id}/valider-compte', [AdminController::class, 'validerCompte'])->middleware('auth:sanctum');
Route::put('/admin/activites/{id}/valider', [AdminController::class, 'validerActivite'])->middleware('auth:sanctum');
Route::put('/admin/activites/{id}/badge-eco', [AdminController::class, 'attribuerBadgeEco'])->middleware('auth:sanctum');
Route::post('/admin/creer-admin', [AdminController::class, 'creerAdmin'])->middleware(['auth:sanctum', 'admin']);

Route::get('/documents-operateur', [DocumentOperateurController::class, 'index']);
Route::post('/documents-operateur', [DocumentOperateurController::class, 'store']);
Route::get('/documents-operateur/{id}/fichier', [DocumentOperateurController::class, 'fichier']);
Route::put('/admin/documents-operateur/{id}', [DocumentOperateurController::class, 'updateStatut']);

Route::get('/categories', [CategorieController::class, 'index']);
Route::post('/categories', [CategorieController::class, 'store']);

Route::get('/activites', [ActiviteController::class, 'index']);
Route::get('/activites/{id}', [ActiviteController::class, 'show']);
Route::post('/activites', [ActiviteController::class, 'store']);
Route::put('/activites/{id}', [ActiviteController::class, 'update']);
Route::delete('/activites/{id}', [ActiviteController::class, 'destroy']);

Route::get('/disponibilites', [DisponibiliteController::class, 'index']);
Route::post('/disponibilites', [DisponibiliteController::class, 'store']);
Route::put('/disponibilites/{id}', [DisponibiliteController::class, 'update']);
Route::post('/disponibilites/{id}/decrementer', [DisponibiliteController::class, 'decrementer']);

Route::get('/reservations', [ReservationController::class, 'index']);
Route::get('/reservations/{id}', [ReservationController::class, 'show']);
Route::post('/reservations', [ReservationController::class, 'store']);
Route::post('/reservations/{id}/preuve-paiement', [ReservationController::class, 'uploaderPreuvePaiement'])->middleware('auth:sanctum');
Route::get('/reservations/{id}/preuve-paiement', [ReservationController::class, 'consulterPreuvePaiement'])->middleware('auth:sanctum');

Route::post('/billets', [BilletController::class, 'store']);
Route::post('/billets/{id}/scanner', [BilletController::class, 'scanner']);

Route::get('/questionnaires-eco', [QuestionnaireEcoController::class, 'index']);
Route::post('/questionnaires-eco', [QuestionnaireEcoController::class, 'store']);
Route::put('/questionnaires-eco/{id}', [QuestionnaireEcoController::class, 'update']);

Route::get('/avis', [AvisController::class, 'index']);
Route::post('/avis', [AvisController::class, 'store']);
Route::put('/avis/{id}', [AvisController::class, 'update']);

Route::get('/langues', [LangueController::class, 'index']);

Route::get('/favoris', [FavoriController::class, 'index']);
Route::post('/favoris', [FavoriController::class, 'store']);
Route::delete('/favoris', [FavoriController::class, 'destroy']);

Route::get('/photos-activite', [PhotoActiviteController::class, 'index']);
Route::post('/photos-activite', [PhotoActiviteController::class, 'store']);
Route::delete('/photos-activite/{id}', [PhotoActiviteController::class, 'destroy']);

Route::get('/villes', [VilleController::class, 'index']);
