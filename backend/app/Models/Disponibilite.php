<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['id_activite', 'date_dispo', 'heure_dispo', 'places_totales', 'places_restantes'])]
class Disponibilite extends Model
{
    protected $table = 'disponibilites';

    public function activite(): BelongsTo
    {
        return $this->belongsTo(Activite::class, 'id_activite');
    }
}
