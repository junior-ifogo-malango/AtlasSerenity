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
        Schema::create('billets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_reservation')->constrained('reservations');
            $table->string('nom_voyageur');
            $table->string('nom_activite');
            $table->date('date_activite');
            $table->integer('nombre_personnes');
            $table->text('qr_code_data');
            $table->boolean('scanne')->default(false);
            $table->timestamp('scanne_le')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('billets');
    }
};
