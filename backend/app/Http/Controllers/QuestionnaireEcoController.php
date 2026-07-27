<?php

namespace App\Http\Controllers;

use App\Models\QuestionnaireEco;
use Illuminate\Http\Request;

class QuestionnaireEcoController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'id_activite' => 'required|exists:activites,id',
        ]);

        return QuestionnaireEco::where('id_activite', $validated['id_activite'])->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_activite' => 'required|exists:activites,id',
            'reponses' => 'required|array',
        ]);

        $questionnaire = QuestionnaireEco::create([
            'id_activite' => $validated['id_activite'],
            'reponses' => $validated['reponses'],
            'valide_par_admin' => false,
        ]);

        return response()->json($questionnaire, 201);
    }

    public function update(Request $request, $id)
    {
        $questionnaire = QuestionnaireEco::findOrFail($id);

        $validated = $request->validate([
            'valide_par_admin' => 'required|boolean',
        ]);

        $questionnaire->update($validated);

        return $questionnaire;
    }
}
