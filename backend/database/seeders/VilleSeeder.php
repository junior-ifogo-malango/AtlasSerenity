<?php

namespace Database\Seeders;

use App\Models\Ville;
use Illuminate\Database\Seeder;

class VilleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $villes = [
            ['nom' => 'Marrakech', 'region' => 'Marrakech-Safi'],
            ['nom' => 'Fès', 'region' => 'Fès-Meknès'],
            ['nom' => 'Chefchaouen', 'region' => 'Tanger-Tétouan-Al Hoceïma'],
            ['nom' => 'Essaouira', 'region' => 'Marrakech-Safi'],
            ['nom' => 'Ifrane', 'region' => 'Fès-Meknès'],
            ['nom' => 'Ouarzazate', 'region' => 'Drâa-Tafilalet'],
            ['nom' => 'Agadir', 'region' => 'Souss-Massa'],
            ['nom' => 'Toubkal', 'region' => 'Marrakech-Safi'],
            ['nom' => 'Ourika', 'region' => 'Marrakech-Safi'],
            ['nom' => 'Azrou', 'region' => 'Fès-Meknès'],
            ['nom' => 'Ait Bouguemez', 'region' => 'Béni Mellal-Khénifra'],
            ['nom' => 'Taroudant', 'region' => 'Souss-Massa'],
            ['nom' => 'Rabat', 'region' => 'Rabat-Salé-Kénitra'],
            ['nom' => 'Casablanca', 'region' => 'Casablanca-Settat'],
            ['nom' => 'Tanger', 'region' => 'Tanger-Tétouan-Al Hoceïma'],
            ['nom' => 'Meknès', 'region' => 'Fès-Meknès'],
            ['nom' => 'Al Hoceima', 'region' => 'Tanger-Tétouan-Al Hoceïma'],
            ['nom' => 'Dakhla', 'region' => 'Dakhla-Oued Ed-Dahab'],
            ['nom' => 'Merzouga', 'region' => 'Drâa-Tafilalet'],
            ['nom' => 'Zagora', 'region' => 'Drâa-Tafilalet'],
            ['nom' => 'Erfoud', 'region' => 'Drâa-Tafilalet'],
            ['nom' => 'Tafraout', 'region' => 'Souss-Massa'],
            ['nom' => 'Larache', 'region' => 'Tanger-Tétouan-Al Hoceïma'],
            ['nom' => 'Safi', 'region' => 'Marrakech-Safi'],
            ['nom' => 'El Jadida', 'region' => 'Casablanca-Settat'],
            ['nom' => 'Beni Mellal', 'region' => 'Béni Mellal-Khénifra'],
            ['nom' => 'Khouribga', 'region' => 'Béni Mellal-Khénifra'],
            ['nom' => 'Nador', 'region' => "L'Oriental"],
            ['nom' => 'Oujda', 'region' => "L'Oriental"],
        ];

        foreach ($villes as $ville) {
            Ville::updateOrCreate(['nom' => $ville['nom']], $ville);
        }
    }
}
