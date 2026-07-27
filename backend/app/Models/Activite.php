<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['titre', 'description', 'region', 'prix_mad', 'badge_eco', 'statut', 'id_operateur', 'id_categorie', 'duree_valeur', 'duree_unite', 'note_moyenne'])]
class Activite extends Model
{
    protected $table = 'activites';

    protected $appends = ['photo'];

    protected function photo(): Attribute
    {
        return Attribute::make(
            get: function () {
                $premierePhoto = $this->photos->sortBy('ordre')->first();

                // On construit l'URL à partir de l'hôte de la requête courante plutôt que
                // de Storage::url() (basé sur APP_URL), qui n'inclut pas le port utilisé
                // par "php artisan serve" en local et pointerait vers un mauvais port.
                return $premierePhoto
                    ? request()->getSchemeAndHttpHost().'/storage/'.$premierePhoto->chemin
                    : null;
            },
        );
    }

    public function operateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_operateur');
    }

    public function categorie(): BelongsTo
    {
        return $this->belongsTo(Categorie::class, 'id_categorie');
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class, 'id_activite');
    }

    public function photos(): HasMany
    {
        return $this->hasMany(PhotoActivite::class, 'id_activite');
    }

    public function disponibilites(): HasMany
    {
        return $this->hasMany(Disponibilite::class, 'id_activite');
    }

    public function langues(): BelongsToMany
    {
        return $this->belongsToMany(Langue::class, 'activite_langues', 'id_activite', 'id_langue');
    }
}
