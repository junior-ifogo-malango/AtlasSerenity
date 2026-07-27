<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::firstOrNew(['email' => env('ADMIN_EMAIL', 'admin@atlasserenity.ma')]);

        // email_verified_at n'est pas dans le Fillable du modèle (volontairement,
        // pour ne jamais être mass-assignable depuis une requête) : forceFill()
        // est requis ici, comme le fait Laravel lui-même dans markEmailAsVerified().
        $admin->forceFill([
            'name' => 'Admin',
            'password' => env('ADMIN_PASSWORD'),
            'role' => 'admin',
            'statut_compte' => 'valide',
            'email_verified_at' => now(),
        ])->save();
    }
}
