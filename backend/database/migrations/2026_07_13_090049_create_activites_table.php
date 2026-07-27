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
        Schema::create('activites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_operateur')->constrained('users');
            $table->foreignId('id_categorie')->constrained('categories');
            $table->string('titre');
            $table->text('description')->nullable();
            $table->string('region');
            $table->decimal('prix_mad', 10, 2);
            $table->boolean('badge_eco')->default(false);
            $table->enum('statut', ['en_attente', 'publie', 'refuse'])->default('en_attente');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activites');
    }
};
