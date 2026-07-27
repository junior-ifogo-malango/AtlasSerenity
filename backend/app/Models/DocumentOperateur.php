<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['id_utilisateur', 'type_document', 'chemin', 'statut', 'commentaire_admin'])]
class DocumentOperateur extends Model
{
    protected $table = 'documents_operateur';

    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_utilisateur');
    }

    public static function typesRequisPour(?string $typeOperateur): array
    {
        return match ($typeOperateur) {
            'guide' => ['certificat_guide', 'assurance'],
            'entreprise' => ['registre_commerce', 'assurance'],
            default => [],
        };
    }
}
