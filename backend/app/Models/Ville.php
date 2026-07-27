<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['nom', 'region'])]
class Ville extends Model
{
    protected $table = 'villes';
}
