<?php

namespace App\Http\Controllers;

use App\Models\Activite;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ReservationController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'id_voyageur' => 'required|exists:users,id',
        ]);

        return Reservation::where('id_voyageur', $validated['id_voyageur'])
            ->with(['activite', 'disponibilite'])
            ->get();
    }

    public function show($id)
    {
        return Reservation::with(['voyageur', 'activite', 'disponibilite'])->findOrFail($id);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_voyageur' => 'required|exists:users,id',
            'id_activite' => 'required|exists:activites,id',
            'id_disponibilite' => 'required|exists:disponibilites,id',
            'nombre_personnes' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($validated) {
            $decrementRequest = Request::create('/', 'POST', [
                'quantite' => $validated['nombre_personnes'],
            ]);

            $resultat = (new DisponibiliteController())->decrementer($decrementRequest, $validated['id_disponibilite']);

            if ($resultat instanceof JsonResponse) {
                return $resultat;
            }

            $activite = Activite::findOrFail($validated['id_activite']);

            $reservation = Reservation::create([
                'id_voyageur' => $validated['id_voyageur'],
                'id_activite' => $validated['id_activite'],
                'id_disponibilite' => $validated['id_disponibilite'],
                'nombre_personnes' => $validated['nombre_personnes'],
                'prix_paye' => $activite->prix_mad * $validated['nombre_personnes'],
                'numero_reservation' => $this->genererNumeroReservation(),
            ]);

            return response()->json($reservation->load(['voyageur', 'activite', 'disponibilite']), 201);
        });
    }

    public function uploaderPreuvePaiement(Request $request, $id)
    {
        $reservation = Reservation::findOrFail($id);

        if ($reservation->id_voyageur !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'preuve' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        $file = $validated['preuve'];
        $chemin = 'preuves_paiement/'.uniqid().'_'.$file->getClientOriginalName();

        Storage::disk('local')->put($chemin, file_get_contents($file));

        $reservation->update([
            'preuve_paiement' => $chemin,
            'statut_paiement' => 'preuve_envoyee',
        ]);

        return $reservation;
    }

    public function consulterPreuvePaiement(Request $request, $id)
    {
        $reservation = Reservation::with('activite')->findOrFail($id);

        $estAdmin = $request->user()->role === 'admin';
        $estOperateur = $request->user()->id === $reservation->activite->id_operateur;

        if (! $estAdmin && ! $estOperateur) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if (! $reservation->preuve_paiement || ! Storage::disk('local')->exists($reservation->preuve_paiement)) {
            return response()->json(['message' => 'Aucune preuve de paiement disponible.'], 404);
        }

        return Storage::disk('local')->response($reservation->preuve_paiement);
    }

    private function genererNumeroReservation(): string
    {
        do {
            $numero = 'RES-'.strtoupper(Str::random(10));
        } while (Reservation::where('numero_reservation', $numero)->exists());

        return $numero;
    }
}
