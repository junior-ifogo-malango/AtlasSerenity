<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['id_voyageur', 'id_activite', 'id_disponibilite', 'nombre_personnes', 'prix_paye', 'numero_reservation', 'statut', 'statut_paiement', 'preuve_paiement'])]
class Reservation extends Model
{
    protected $table = 'reservations';

    public function voyageur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_voyageur');
    }

    public function activite(): BelongsTo
    {
        return $this->belongsTo(Activite::class, 'id_activite');
    }

    public function disponibilite(): BelongsTo
    {
        return $this->belongsTo(Disponibilite::class, 'id_disponibilite');
    }
}
