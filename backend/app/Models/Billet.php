<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['id_reservation', 'nom_voyageur', 'nom_activite', 'date_activite', 'nombre_personnes', 'qr_code_data', 'scanne', 'scanne_le'])]
class Billet extends Model
{
    protected $table = 'billets';

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class, 'id_reservation');
    }
}
