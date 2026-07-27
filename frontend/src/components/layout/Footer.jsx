import { Link } from "react-router-dom"
import logo from "../../assets/atlasserenity-logo.png"

const COLONNES = [
  {
    titre: "Navigation",
    liens: [
      { label: "Rechercher une activité", to: "/recherche" },
      { label: "Favoris", to: "/favoris" },
      { label: "Mes réservations", to: "/mes-reservations" },
    ],
  },
  {
    titre: "Légal",
    liens: [
      { label: "Mentions légales", to: "/mentions-legales" },
      { label: "CGU", to: "/cgu" },
      { label: "Politique de confidentialité", to: "/politique-confidentialite" },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t-2 border-ocre bg-sable">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-4">
          {COLONNES.map((colonne) => (
            <div key={colonne.titre}>
              <h3 className="mb-3 font-fraunces text-sm font-semibold uppercase tracking-wide text-ink">
                {colonne.titre}
              </h3>
              <ul className="space-y-2">
                {colonne.liens.map((lien) => (
                  <li key={lien.label}>
                    <Link to={lien.to} className="text-sm text-ink/70 hover:text-cedre">
                      {lien.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="mb-3 font-fraunces text-sm font-semibold uppercase tracking-wide text-ink">
              Compte
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/login" className="text-sm text-ink/70 hover:text-cedre">
                  Se connecter
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-sm text-ink/70 hover:text-cedre">
                  S'inscrire
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-sm font-medium text-argile hover:underline">
                  Devenir opérateur
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-fraunces text-sm font-semibold uppercase tracking-wide text-ink">
              Contact
            </h3>
            <a
              href="mailto:contact@atlasserenity.ma"
              className="text-sm text-ink/70 hover:text-cedre"
            >
              contact@atlasserenity.ma
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 border-t border-ink/10 pt-8 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="AtlasSerenity" className="h-10 w-auto" />
            <p className="text-sm text-ink/60">L'écotourisme authentique, au cœur de l'Atlas.</p>
          </div>
          <p className="text-sm text-ink/50">
            © {new Date().getFullYear()} AtlasSerenity. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
