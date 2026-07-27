import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import logo from "../../assets/atlasserenity-logo.png"

export default function Footer() {
  const { t } = useTranslation()

  const COLONNES = [
    {
      titre: t("footer.navigationTitle"),
      liens: [
        { label: t("footer.searchActivity"), to: "/recherche" },
        { label: t("footer.favorites"), to: "/favoris" },
        { label: t("footer.myReservations"), to: "/mes-reservations" },
      ],
    },
    {
      titre: t("footer.legalTitle"),
      liens: [
        { label: t("footer.legalNotice"), to: "/mentions-legales" },
        { label: t("footer.termsOfService"), to: "/cgu" },
        { label: t("footer.privacyPolicy"), to: "/politique-confidentialite" },
      ],
    },
  ]

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
              {t("footer.accountTitle")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/login" className="text-sm text-ink/70 hover:text-cedre">
                  {t("footer.login")}
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-sm text-ink/70 hover:text-cedre">
                  {t("footer.register")}
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-sm font-medium text-argile hover:underline">
                  {t("footer.becomeOperator")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-fraunces text-sm font-semibold uppercase tracking-wide text-ink">
              {t("footer.contactTitle")}
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
            <p className="text-sm text-ink/60">{t("footer.tagline")}</p>
          </div>
          <p className="text-sm text-ink/50">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  )
}
