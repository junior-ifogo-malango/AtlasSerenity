<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['id_activite', 'reponses', 'valide_par_admin'])]
class QuestionnaireEco extends Model
{
    protected $table = 'questionnaires_eco';

    protected $casts = [
        'reponses' => 'array',
    ];

    public function activite(): BelongsTo
    {
        return $this->belongsTo(Activite::class, 'id_activite');
    }
}
