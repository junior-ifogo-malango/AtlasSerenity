<?php

namespace App\Http\Controllers;

use App\Models\PhotoActivite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PhotoActiviteController extends Controller
{
    private const LARGEUR_MAX = 1200;

    private const QUALITE_WEBP = 80;

    public function index(Request $request)
    {
        $validated = $request->validate([
            'id_activite' => 'required|exists:activites,id',
        ]);

        return PhotoActivite::where('id_activite', $validated['id_activite'])
            ->orderBy('ordre')
            ->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_activite' => 'required|exists:activites,id',
            'photos' => 'required|array|min:5|max:30',
            'photos.*' => 'image|max:5120',
        ], [
            // Le HEIC/HEIF (format par défaut des photos iPhone) n'est pas dans la
            // liste gérée par la règle "image" de Laravel (jpg/jpeg/png/gif/bmp/webp)
            // et n'est décodable ni par GD (utilisé pour l'optimisation) ni par
            // Imagick (non installé) sans dépendance système lourde (libheif). On le
            // rejette donc explicitement avec un message actionnable plutôt que de
            // laisser passer un message générique.
            'photos.*.image' => "Format d'image non supporté (le HEIC/HEIF des iPhone n'est pas géré) : convertissez vos photos en JPEG, PNG ou WebP avant l'envoi.",
        ]);

        $photos = [];

        foreach ($request->file('photos') as $index => $file) {
            $nomBase = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $optimisee = $this->optimiserImage(file_get_contents($file));

            $extension = $optimisee !== null ? 'webp' : $file->getClientOriginalExtension();
            $chemin = 'photos_activites/'.uniqid().'_'.$nomBase.'.'.$extension;

            Storage::disk('public')->put($chemin, $optimisee ?? file_get_contents($file));

            $photos[] = PhotoActivite::create([
                'id_activite' => $validated['id_activite'],
                'chemin' => $chemin,
                'ordre' => $index,
            ]);
        }

        return response()->json($photos, 201);
    }

    // Redimensionne à une largeur max de 1200px et recompresse en WebP qualité
    // 80 pour éviter de servir les photos telles qu'uploadées par les opérateurs
    // (souvent plusieurs centaines de Ko à quelques Mo). WebP plutôt que JPEG :
    // à qualité égale il produit des fichiers plus légers, y compris quand la
    // source est déjà dans un format très compressé (AVIF, WebP). Retourne null
    // si GD ne sait pas décoder le format (ex. SVG), auquel cas l'appelant garde
    // le fichier original tel quel.
    private function optimiserImage(string $contenu): ?string
    {
        $source = @imagecreatefromstring($contenu);

        if ($source === false) {
            return null;
        }

        $largeur = imagesx($source);
        $hauteur = imagesy($source);

        if ($largeur > self::LARGEUR_MAX) {
            $nouvelleHauteur = (int) round($hauteur * (self::LARGEUR_MAX / $largeur));
            $redimensionnee = imagecreatetruecolor(self::LARGEUR_MAX, $nouvelleHauteur);
            imagecopyresampled(
                $redimensionnee, $source, 0, 0, 0, 0,
                self::LARGEUR_MAX, $nouvelleHauteur, $largeur, $hauteur
            );
            imagedestroy($source);
            $source = $redimensionnee;
        }

        ob_start();
        imagewebp($source, null, self::QUALITE_WEBP);
        $optimisee = ob_get_clean();
        imagedestroy($source);

        return $optimisee;
    }

    public function destroy($id)
    {
        $photo = PhotoActivite::findOrFail($id);

        Storage::disk('public')->delete($photo->chemin);

        $photo->delete();

        return response()->json(null, 204);
    }
}
