<?php

namespace App\Http\Controllers;

use App\Models\Langue;

class LangueController extends Controller
{
    public function index()
    {
        return Langue::all();
    }
}
