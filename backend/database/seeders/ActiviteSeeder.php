<?php

namespace Database\Seeders;

use App\Models\Activite;
use App\Models\Categorie;
use App\Models\User;
use Illuminate\Database\Seeder;

class ActiviteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $operateur1 = User::updateOrCreate(
            ['email' => 'yassine.amrani@atlasserenity.ma'],
            [
                'name' => 'Yassine Amrani',
                'password' => 'password',
                'role' => 'operateur',
                'statut_compte' => 'valide',
            ]
        );

        $operateur2 = User::updateOrCreate(
            ['email' => 'fatimazahra.bennani@atlasserenity.ma'],
            [
                'name' => 'Fatima Zahra Bennani',
                'password' => 'password',
                'role' => 'operateur',
                'statut_compte' => 'valide',
            ]
        );

        $categorieId = fn (string $nom) => Categorie::where('nom', $nom)->value('id');

        $activites = [
            [
                'titre' => 'Ascension guidée du sommet du Toubkal',
                'description' => "Randonnée de deux jours vers le plus haut sommet d'Afrique du Nord (4 167 m), encadrée par un guide de montagne certifié. Nuit en refuge, panorama à 360° sur le Haut Atlas au lever du soleil. Départ et retour en minibus privé depuis Marrakech.",
                'region' => 'Toubkal, Haut Atlas (au départ de Marrakech)',
                'id_categorie' => $categorieId('Randonnées'),
                'prix_mad' => 850.00,
                'duree_valeur' => 2.00,
                'duree_unite' => 'jours',
                'badge_eco' => false,
                'note_moyenne' => 4.80,
                'statut' => 'publie',
                'id_operateur' => $operateur1->id,
            ],
            [
                'titre' => "Balade à dos de mulet dans la vallée de l'Ourika",
                'description' => "Excursion familiale à travers les villages berbères et les cascades de Setti Fatma, à dos de mulet aux côtés d'un muletier local. Halte thé à la menthe chez l'habitant. Transfert aller-retour depuis Marrakech inclus.",
                'region' => 'Ourika, Haut Atlas (au départ de Marrakech)',
                'id_categorie' => $categorieId('Randonnées'),
                'prix_mad' => 320.00,
                'duree_valeur' => 4.00,
                'duree_unite' => 'heures',
                'badge_eco' => false,
                'note_moyenne' => 4.50,
                'statut' => 'publie',
                'id_operateur' => $operateur1->id,
            ],
            [
                'titre' => 'Séjour éco-lodge dans les montagnes bleues de Chefchaouen',
                'description' => "Deux nuits dans un éco-lodge en pierre sèche construit selon les techniques traditionnelles du Rif, énergie solaire et potager en permaculture. Inclut une randonnée vers le parc naturel de Talassemtane.",
                'region' => 'Chefchaouen, Rif',
                'id_categorie' => $categorieId('Éco-lodges'),
                'prix_mad' => 1200.00,
                'duree_valeur' => 3.00,
                'duree_unite' => 'jours',
                'badge_eco' => true,
                'note_moyenne' => 4.90,
                'statut' => 'publie',
                'id_operateur' => $operateur2->id,
            ],
            [
                'titre' => 'Sortie en voilier et observation des dauphins à Essaouira',
                'description' => "Navigation à la voile le long de la côte atlantique d'Essaouira à la recherche de dauphins, suivie d'une dégustation de fruits de mer grillés sur le port aux mouettes.",
                'region' => 'Essaouira, Côte Atlantique',
                'id_categorie' => $categorieId('Observation de la faune'),
                'prix_mad' => 450.00,
                'duree_valeur' => 3.00,
                'duree_unite' => 'heures',
                'badge_eco' => false,
                'note_moyenne' => 4.60,
                'statut' => 'publie',
                'id_operateur' => $operateur2->id,
            ],
            [
                'titre' => "Atelier de tissage berbère avec les artisanes d'Ait Bouguemez",
                'description' => "Initiation au tissage de tapis berbères traditionnels auprès d'une coopérative de femmes de la vallée d'Ait Bouguemez, dite la « vallée heureuse ». Repas partagé et vente équitable de l'artisanat local.",
                'region' => 'Ait Bouguemez, Moyen Atlas',
                'id_categorie' => $categorieId('Artisanat local'),
                'prix_mad' => 300.00,
                'duree_valeur' => 5.00,
                'duree_unite' => 'heures',
                'badge_eco' => true,
                'note_moyenne' => 4.70,
                'statut' => 'publie',
                'id_operateur' => $operateur1->id,
            ],
            [
                'titre' => "Journée à la ferme agroécologique de la vallée du Souss",
                'description' => "Visite d'une coopérative d'agritourisme spécialisée dans l'huile d'argan et le safran, récolte participative selon la saison et repas biologique préparé avec les produits de la ferme.",
                'region' => 'Vallée du Souss, Taroudant',
                'id_categorie' => $categorieId('Agritourisme'),
                'prix_mad' => 380.00,
                'duree_valeur' => 6.00,
                'duree_unite' => 'heures',
                'badge_eco' => true,
                'note_moyenne' => 4.40,
                'statut' => 'publie',
                'id_operateur' => $operateur2->id,
            ],
        ];

        foreach ($activites as $activite) {
            Activite::updateOrCreate(
                ['titre' => $activite['titre']],
                $activite
            );
        }
    }
}
