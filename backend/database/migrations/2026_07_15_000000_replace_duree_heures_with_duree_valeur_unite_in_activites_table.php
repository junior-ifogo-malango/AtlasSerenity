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
        Schema::table('activites', function (Blueprint $table) {
            $table->dropColumn('duree_heures');
        });

        Schema::table('activites', function (Blueprint $table) {
            $table->decimal('duree_valeur', 4, 2);
            $table->enum('duree_unite', ['minutes', 'heures', 'jours']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('activites', function (Blueprint $table) {
            $table->dropColumn(['duree_valeur', 'duree_unite']);
        });

        Schema::table('activites', function (Blueprint $table) {
            $table->decimal('duree_heures', 4, 2);
        });
    }
};
