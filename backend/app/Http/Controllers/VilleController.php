<?php

namespace App\Http\Controllers;

use App\Models\Ville;

class VilleController extends Controller
{
    public function index()
    {
        return Ville::all();
    }
}
