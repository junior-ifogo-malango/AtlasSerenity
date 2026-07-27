<?php

namespace App\Http\Controllers;

use App\Models\Activite;
use App\Models\Avis;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Http\Request;

class AdminStatsController extends Controller
{
    public function __construct()
    {
        $this->middleware('admin');
    }

    public function dashboard(Request $request)
    {
        $depuis = now()->subMonths(5)->startOfMonth();

        $reservationsParMois = Reservation::where('created_at', '>=', $depuis)
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as mois, COUNT(*) as total")
            ->groupBy('mois')
            ->orderBy('mois')
            ->get();

        $revenusParMois = Reservation::where('created_at', '>=', $depuis)
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as mois, SUM(prix_paye) as total")
            ->groupBy('mois')
            ->orderBy('mois')
            ->get();

        $activitesParCategorie = Activite::where('statut', 'publie')
            ->join('categories', 'categories.id', '=', 'activites.id_categorie')
            ->selectRaw('categories.nom as categorie, COUNT(*) as total')
            ->groupBy('categories.nom')
            ->get();

        $activitesParRegion = Activite::where('statut', 'publie')
            ->selectRaw('region, COUNT(*) as total')
            ->groupBy('region')
            ->get();

        $comptesEnAttente = User::where('statut_compte', 'en_attente')->count();

        $noteMoyenneGlobale = Avis::where('statut', 'publie')->avg('note');

        $debutMois = now()->startOfMonth();

        $reservationsCeMois = Reservation::where('created_at', '>=', $debutMois)->count();

        $revenusCeMois = Reservation::where('created_at', '>=', $debutMois)->sum('prix_paye');

        $topActivites = Activite::withCount('reservations')
            ->orderByDesc('reservations_count')
            ->take(5)
            ->get(['id', 'titre']);

        return response()->json([
            'reservations_par_mois' => $reservationsParMois,
            'revenus_par_mois' => $revenusParMois,
            'activites_par_categorie' => $activitesParCategorie,
            'activites_par_region' => $activitesParRegion,
            'comptes_en_attente' => $comptesEnAttente,
            'note_moyenne_globale' => $noteMoyenneGlobale !== null ? round($noteMoyenneGlobale, 2) : null,
            'reservations_ce_mois' => $reservationsCeMois,
            'revenus_ce_mois' => (float) $revenusCeMois,
            'top_activites' => $topActivites,
        ]);
    }
}
