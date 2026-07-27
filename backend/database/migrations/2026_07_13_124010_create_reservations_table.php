<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_voyageur')->constrained('users');
            $table->foreignId('id_activite')->constrained('activites');
            $table->foreignId('id_disponibilite')->constrained('disponibilites');
            $table->integer('nombre_personnes');
            $table->decimal('prix_paye', 10, 2);
            $table->string('numero_reservation')->unique();
            $table->enum('statut', ['en_attente', 'confirmee', 'annulee'])->default('en_attente');
            $table->enum('statut_paiement', ['non_paye', 'preuve_envoyee', 'valide'])->default('non_paye');
            $table->string('preuve_paiement')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
