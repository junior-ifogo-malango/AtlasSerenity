<?php

namespace App\Http\Controllers;

use App\Models\Avis;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AvisController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'id_activite' => 'required|exists:activites,id',
        ]);

        return Avis::where('statut', 'publie')
            ->whereHas('reservation', function ($query) use ($validated) {
                $query->where('id_activite', $validated['id_activite']);
            })
            ->with('reservation')
            ->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_reservation' => 'required|exists:reservations,id|unique:avis,id_reservation',
            'note' => 'required|integer|min:1|max:5',
            'commentaire' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            $avis = Avis::create($validated);

            $reservation = Reservation::findOrFail($validated['id_reservation']);
            $activite = $reservation->activite;

            $noteMoyenne = Avis::whereHas('reservation', function ($query) use ($activite) {
                $query->where('id_activite', $activite->id);
            })->avg('note');

            $activite->update(['note_moyenne' => round($noteMoyenne, 2)]);

            return response()->json($avis, 201);
        });
    }

    public function update(Request $request, $id)
    {
        $avis = Avis::findOrFail($id);

        $validated = $request->validate([
            'reponse_operateur' => 'required|string',
        ]);

        $avis->update($validated);

        return $avis;
    }
}
