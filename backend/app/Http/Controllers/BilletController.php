<?php

namespace App\Http\Controllers;

use App\Models\Billet;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class BilletController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_reservation' => 'required|exists:reservations,id',
        ]);

        $reservation = Reservation::with(['voyageur', 'activite', 'disponibilite'])
            ->findOrFail($validated['id_reservation']);

        $nomVoyageur = $reservation->voyageur->name;
        $nomActivite = $reservation->activite->titre;
        $dateActivite = $reservation->disponibilite->date_dispo;
        $nombrePersonnes = $reservation->nombre_personnes;

        $qrCodeData = json_encode([
            'nom_voyageur' => $nomVoyageur,
            'nom_activite' => $nomActivite,
            'date' => $dateActivite,
            'nombre_personnes' => $nombrePersonnes,
        ], JSON_UNESCAPED_UNICODE);

        $qrImage = (string) QrCode::format('svg')->size(300)->generate($qrCodeData);

        $chemin = 'billets/'.Str::uuid().'.svg';
        Storage::disk('public')->put($chemin, $qrImage);

        $billet = Billet::create([
            'id_reservation' => $reservation->id,
            'nom_voyageur' => $nomVoyageur,
            'nom_activite' => $nomActivite,
            'date_activite' => $dateActivite,
            'nombre_personnes' => $nombrePersonnes,
            'qr_code_data' => $qrCodeData,
        ]);

        $billet->qr_code_url = Storage::disk('public')->url($chemin);

        return response()->json($billet, 201);
    }

    public function scanner($id)
    {
        $billet = Billet::findOrFail($id);

        $billet->update([
            'scanne' => true,
            'scanne_le' => now(),
        ]);

        return $billet;
    }
}
