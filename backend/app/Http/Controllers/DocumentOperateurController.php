<?php

namespace App\Http\Controllers;

use App\Models\DocumentOperateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentOperateurController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('admin')->only(['updateStatut']);
    }

    public function index(Request $request)
    {
        $validated = $request->validate([
            'id_utilisateur' => 'required|exists:users,id',
        ]);

        if ($request->user()->id !== (int) $validated['id_utilisateur'] && $request->user()->role !== 'admin') {
            abort(403);
        }

        return DocumentOperateur::where('id_utilisateur', $validated['id_utilisateur'])->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type_document' => 'required|in:certificat_guide,assurance,registre_commerce,autre',
            'document' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        $user = $request->user();
        $file = $validated['document'];
        $chemin = 'documents_operateur/'.uniqid().'_'.$file->getClientOriginalName();

        $document = DocumentOperateur::where('id_utilisateur', $user->id)
            ->where('type_document', $validated['type_document'])
            ->first();

        if ($document && Storage::disk('local')->exists($document->chemin)) {
            Storage::disk('local')->delete($document->chemin);
        }

        Storage::disk('local')->put($chemin, file_get_contents($file));

        if ($document) {
            $document->update([
                'chemin' => $chemin,
                'statut' => 'en_attente',
                'commentaire_admin' => null,
            ]);
        } else {
            $document = DocumentOperateur::create([
                'id_utilisateur' => $user->id,
                'type_document' => $validated['type_document'],
                'chemin' => $chemin,
                'statut' => 'en_attente',
            ]);
        }

        return response()->json($document, 201);
    }

    public function fichier(Request $request, $id)
    {
        $document = DocumentOperateur::findOrFail($id);

        $estAdmin = $request->user()->role === 'admin';
        $estProprietaire = $request->user()->id === $document->id_utilisateur;

        if (! $estAdmin && ! $estProprietaire) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if (! Storage::disk('local')->exists($document->chemin)) {
            return response()->json(['message' => 'Fichier introuvable.'], 404);
        }

        return Storage::disk('local')->response($document->chemin);
    }

    public function updateStatut(Request $request, $id)
    {
        $document = DocumentOperateur::findOrFail($id);

        $validated = $request->validate([
            'statut' => 'required|in:valide,refuse',
            'commentaire_admin' => 'nullable|string',
        ]);

        $document->update($validated);

        return $document;
    }
}
