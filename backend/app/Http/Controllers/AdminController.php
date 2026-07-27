<?php

namespace App\Http\Controllers;

use App\Models\Activite;
use App\Models\DocumentOperateur;
use App\Models\QuestionnaireEco;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function __construct()
    {
        $this->middleware('admin');
    }

    public function validerCompte(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if ($user->role === 'operateur') {
            $typesRequis = DocumentOperateur::typesRequisPour($user->type_operateur);

            $typesValides = DocumentOperateur::where('id_utilisateur', $user->id)
                ->where('statut', 'valide')
                ->pluck('type_document')
                ->all();

            $typesManquants = array_values(array_diff($typesRequis, $typesValides));

            if (! empty($typesManquants)) {
                return response()->json([
                    'message' => 'Impossible de valider ce compte : documents obligatoires manquants ou non validés.',
                    'documents_manquants' => $typesManquants,
                ], 422);
            }
        }

        $user->update(['statut_compte' => 'valide']);

        return $user;
    }

    public function validerActivite(Request $request, $id)
    {
        $activite = Activite::findOrFail($id);
        $activite->update(['statut' => 'publie']);

        return $activite;
    }

    public function attribuerBadgeEco(Request $request, $id)
    {
        $activite = Activite::findOrFail($id);

        $questionnaire = QuestionnaireEco::where('id_activite', $activite->id)->first();

        if (! $questionnaire || ! $questionnaire->valide_par_admin) {
            return response()->json([
                'message' => "Cette activité n'a pas de questionnaire éco validé par un admin.",
            ], 422);
        }

        $activite->update(['badge_eco' => true]);

        return $activite;
    }

    public function creerAdmin(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        $admin = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => 'admin',
            'statut_compte' => 'valide',
        ]);

        return response()->json($admin, 201);
    }
}
