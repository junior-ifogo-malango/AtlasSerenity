<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['id_voyageur', 'id_activite'])]
class Favori extends Model
{
    protected $table = 'favoris';

    public function voyageur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_voyageur');
    }

    public function activite(): BelongsTo
    {
        return $this->belongsTo(Activite::class, 'id_activite');
    }
}
