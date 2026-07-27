<?php

namespace App\Http\Controllers;

use App\Models\Disponibilite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DisponibiliteController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'id_activite' => 'required|exists:activites,id',
        ]);

        return Disponibilite::where('id_activite', $validated['id_activite'])->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_activite' => 'required|exists:activites,id',
            'date_dispo' => 'required|date',
            'heure_dispo' => 'required|date_format:H:i',
            'places_totales' => 'required|integer|min:1',
            'places_restantes' => 'sometimes|integer|min:0|lte:places_totales',
        ]);

        $validated['places_restantes'] ??= $validated['places_totales'];

        $disponibilite = Disponibilite::create($validated);

        return response()->json($disponibilite, 201);
    }

    public function update(Request $request, $id)
    {
        $disponibilite = Disponibilite::findOrFail($id);

        $validated = $request->validate([
            'date_dispo' => 'sometimes|required|date',
            'heure_dispo' => 'sometimes|required|date_format:H:i',
            'places_totales' => 'sometimes|required|integer|min:1',
        ]);

        $placesTotales = $validated['places_totales'] ?? $disponibilite->places_totales;

        if ($disponibilite->places_restantes > $placesTotales) {
            return response()->json([
                'message' => 'places_totales ne peut pas être inférieur à places_restantes.',
            ], 422);
        }

        $disponibilite->update($validated);

        return $disponibilite;
    }

    public function decrementer(Request $request, $id)
    {
        $validated = $request->validate([
            'quantite' => 'sometimes|integer|min:1',
        ]);

        $quantite = $validated['quantite'] ?? 1;

        return DB::transaction(function () use ($id, $quantite) {
            $disponibilite = Disponibilite::where('id', $id)->lockForUpdate()->firstOrFail();

            if ($disponibilite->places_restantes < $quantite) {
                return response()->json([
                    'message' => 'Places restantes insuffisantes.',
                ], 409);
            }

            $disponibilite->decrement('places_restantes', $quantite);

            return $disponibilite->refresh();
        });
    }
}
