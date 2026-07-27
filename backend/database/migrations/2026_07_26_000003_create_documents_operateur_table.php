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
        Schema::create('documents_operateur', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_utilisateur')->constrained('users')->cascadeOnDelete();
            $table->enum('type_document', ['certificat_guide', 'assurance', 'registre_commerce', 'autre']);
            $table->string('chemin');
            $table->enum('statut', ['en_attente', 'valide', 'refuse'])->default('en_attente');
            $table->text('commentaire_admin')->nullable();
            $table->timestamps();

            $table->unique(['id_utilisateur', 'type_document']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents_operateur');
    }
};
