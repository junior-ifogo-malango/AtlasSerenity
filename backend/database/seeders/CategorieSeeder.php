<?php

namespace Database\Seeders;

use App\Models\Categorie;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorieSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Randonnées',
            'Éco-lodges',
            'Agritourisme',
            'Observation de la faune',
            'Artisanat local',
        ];

        foreach ($categories as $nom) {
            Categorie::updateOrCreate(['nom' => $nom]);
        }
    }
}
