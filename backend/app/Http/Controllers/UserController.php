<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware('admin')->except(['update', 'updatePassword']);
    }

    public function index(Request $request)
    {
        $validated = $request->validate([
            'statut_compte' => 'sometimes|in:en_attente,valide,refuse',
            'role' => 'sometimes|in:voyageur,operateur,admin',
        ]);

        $query = User::query();

        if (isset($validated['statut_compte'])) {
            $query->where('statut_compte', $validated['statut_compte']);
        }

        if (isset($validated['role'])) {
            $query->where('role', $validated['role']);
        }

        return $query->get();
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if ($request->user()->id !== $user->id && $request->user()->role !== 'admin') {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
            'telephone' => [$user->role === 'operateur' ? 'required' : 'sometimes', 'nullable', 'string', 'max:30'],
            'notif_reservations' => 'sometimes|boolean',
            'notif_messages' => 'sometimes|boolean',
            'notif_newsletter' => 'sometimes|boolean',
        ]);

        $user->update($validated);

        return $user;
    }

    public function updatePassword(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if ($request->user()->id !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if (! Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'errors' => ['current_password' => ['Le mot de passe actuel est incorrect.']],
            ], 422);
        }

        $user->forceFill(['password' => $validated['password']])->save();

        return response()->json(['message' => 'Mot de passe mis à jour avec succès.']);
    }
}
