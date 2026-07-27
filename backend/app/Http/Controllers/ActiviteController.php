<?php

namespace App\Http\Controllers;

use App\Models\Activite;
use Illuminate\Http\Request;

class ActiviteController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'q' => 'sometimes|string|max:255',
            'region' => 'sometimes|string|max:255',
            'id_categorie' => 'sometimes|exists:categories,id',
            'categories' => 'sometimes|array',
            'categories.*' => 'exists:categories,id',
            'villes' => 'sometimes|array',
            'villes.*' => 'string|max:255',
            'prix_min' => 'sometimes|numeric',
            'prix_max' => 'sometimes|numeric',
            'duree_unite' => 'sometimes|in:minutes,heures,jours',
            'duree_min' => 'sometimes|numeric',
            'duree_max' => 'sometimes|numeric',
            'note_min' => 'sometimes|numeric|min:0|max:5',
            'heure_debut' => 'sometimes|array',
            'heure_debut.*' => 'in:matin,apres_midi,soiree',
            'id_langue' => 'sometimes|exists:langues,id',
            'id_operateur' => 'sometimes|exists:users,id',
            'statut' => 'sometimes|in:en_attente,publie,refuse',
        ]);

        $query = Activite::with([
            'operateur',
            'categorie',
            'langues',
            'photos' => fn ($q) => $q->orderBy('ordre'),
        ]);

        if (isset($validated['id_operateur'])) {
            $query->where('id_operateur', $validated['id_operateur']);
        }

        if (isset($validated['statut'])) {
            $query->where('statut', $validated['statut']);
        } elseif (! isset($validated['id_operateur'])) {
            $query->where('statut', 'publie');
        }

        if (isset($validated['region'])) {
            $query->where('region', 'LIKE', '%' . $validated['region'] . '%');
        }

        if (isset($validated['q']) && trim($validated['q']) !== '') {
            $mots = array_filter(preg_split('/\s+/', trim($validated['q'])), fn ($mot) => $mot !== '');

            $query->where(function ($q) use ($mots) {
                foreach ($mots as $mot) {
                    $motif = '%' . $this->motifRecherche($mot) . '%';

                    $q->where(function ($sub) use ($motif) {
                        $sub->where('titre', 'LIKE', $motif)
                            ->orWhere('description', 'LIKE', $motif)
                            ->orWhere('region', 'LIKE', $motif)
                            ->orWhereHas('categorie', function ($c) use ($motif) {
                                $c->where('nom', 'LIKE', $motif);
                            });
                    });
                }
            });
        }

        if (isset($validated['id_categorie'])) {
            $query->where('id_categorie', $validated['id_categorie']);
        }

        if (isset($validated['categories'])) {
            $query->whereIn('id_categorie', $validated['categories']);
        }

        if (isset($validated['villes'])) {
            $query->where(function ($q) use ($validated) {
                foreach ($validated['villes'] as $ville) {
                    $q->orWhere('region', 'LIKE', '%' . $ville . '%');
                }
            });
        }

        if (isset($validated['prix_min'])) {
            $query->where('prix_mad', '>=', $validated['prix_min']);
        }

        if (isset($validated['prix_max'])) {
            $query->where('prix_mad', '<=', $validated['prix_max']);
        }

        if (isset($validated['duree_unite'])) {
            $query->where('duree_unite', $validated['duree_unite']);
        }

        if (isset($validated['duree_min'])) {
            $query->where('duree_valeur', '>=', $validated['duree_min']);
        }

        if (isset($validated['duree_max'])) {
            $query->where('duree_valeur', '<=', $validated['duree_max']);
        }

        if (isset($validated['note_min'])) {
            $query->where('note_moyenne', '>=', $validated['note_min']);
        }

        if (isset($validated['heure_debut'])) {
            $query->whereHas('disponibilites', function ($q) use ($validated) {
                $q->where(function ($sub) use ($validated) {
                    foreach ($validated['heure_debut'] as $plage) {
                        $sub->orWhere(function ($w) use ($plage) {
                            match ($plage) {
                                'matin' => $w->whereTime('heure_dispo', '<', '12:00:00'),
                                'apres_midi' => $w->whereTime('heure_dispo', '>=', '12:00:00')
                                    ->whereTime('heure_dispo', '<', '17:00:00'),
                                'soiree' => $w->whereTime('heure_dispo', '>=', '17:00:00'),
                            };
                        });
                    }
                });
            });
        }

        if (isset($validated['id_langue'])) {
            $query->whereHas('langues', function ($q) use ($validated) {
                $q->where('langues.id', $validated['id_langue']);
            });
        }

        return $query->get();
    }

    // Radical grossier pour tolérer les variantes grammaticales proches
    // (ex. "randonner" -> "rando" matche aussi "randonnées"), sans vraie
    // racinisation. Les mots courts (<=5 caractères) ne sont pas tronqués :
    // le risque de faux positifs y est trop élevé pour le gain de recall.
    private function motifRecherche(string $mot): string
    {
        $longueur = mb_strlen($mot);
        $radical = $longueur <= 5 ? $mot : mb_substr($mot, 0, max(4, $longueur - 4));

        return str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $radical);
    }

    public function show($id)
    {
        return Activite::with(['operateur', 'categorie', 'langues', 'photos'])->findOrFail($id);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'region' => 'required|string|max:255',
            'prix_mad' => 'required|numeric',
            'badge_eco' => 'boolean',
            'statut' => 'in:en_attente,publie,refuse',
            'id_operateur' => 'required|exists:users,id',
            'id_categorie' => 'required|exists:categories,id',
            'duree_valeur' => 'required|numeric',
            'duree_unite' => 'required|in:minutes,heures,jours',
            'langues' => 'array',
            'langues.*' => 'exists:langues,id',
        ]);

        $activite = Activite::create($validated);

        if (isset($validated['langues'])) {
            $activite->langues()->sync($validated['langues']);
        }

        return response()->json($activite->load(['operateur', 'categorie', 'langues']), 201);
    }

    public function update(Request $request, $id)
    {
        $activite = Activite::findOrFail($id);

        $validated = $request->validate([
            'titre' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'region' => 'sometimes|required|string|max:255',
            'prix_mad' => 'sometimes|required|numeric',
            'badge_eco' => 'boolean',
            'statut' => 'in:en_attente,publie,refuse',
            'id_operateur' => 'sometimes|required|exists:users,id',
            'id_categorie' => 'sometimes|required|exists:categories,id',
            'duree_valeur' => 'sometimes|required|numeric',
            'duree_unite' => 'sometimes|required|in:minutes,heures,jours',
            'langues' => 'array',
            'langues.*' => 'exists:langues,id',
        ]);

        $activite->update($validated);

        if (isset($validated['langues'])) {
            $activite->langues()->sync($validated['langues']);
        }

        return $activite->load(['operateur', 'categorie', 'langues']);
    }

    public function destroy($id)
    {
        $activite = Activite::findOrFail($id);
        $activite->delete();

        return response()->json(null, 204);
    }
}
