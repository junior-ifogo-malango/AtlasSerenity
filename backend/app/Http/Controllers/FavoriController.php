<?php

namespace App\Http\Controllers;

use App\Models\Favori;
use Illuminate\Http\Request;

class FavoriController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'id_voyageur' => 'required|exists:users,id',
        ]);

        return Favori::where('id_voyageur', $validated['id_voyageur'])
            ->with('activite')
            ->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_voyageur' => 'required|exists:users,id',
            'id_activite' => 'required|exists:activites,id',
        ]);

        $favori = Favori::firstOrCreate($validated);

        return response()->json($favori->load('activite'), $favori->wasRecentlyCreated ? 201 : 200);
    }

    public function destroy(Request $request)
    {
        $validated = $request->validate([
            'id_voyageur' => 'required|exists:users,id',
            'id_activite' => 'required|exists:activites,id',
        ]);

        Favori::where('id_voyageur', $validated['id_voyageur'])
            ->where('id_activite', $validated['id_activite'])
            ->delete();

        return response()->json(null, 204);
    }
}
