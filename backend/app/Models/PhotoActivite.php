<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['id_activite', 'chemin', 'ordre'])]
class PhotoActivite extends Model
{
    protected $table = 'photos_activite';

    public function activite(): BelongsTo
    {
        return $this->belongsTo(Activite::class, 'id_activite');
    }
}
