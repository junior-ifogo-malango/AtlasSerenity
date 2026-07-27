import Header from "../../components/layout/Header"

export default function PolitiqueConfidentialite() {
  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="mb-8 font-fraunces text-3xl font-semibold leading-snug text-ink">
          Politique de confidentialité
        </h1>

        <div className="space-y-4 text-base text-ink/80">
          <p>
            AtlasSerenity collecte les données personnelles nécessaires à la création de compte,
            à la gestion des réservations et à l'amélioration de ses services.
          </p>
          <p>
            Vos données ne sont jamais revendues à des tiers. Vous pouvez à tout moment demander
            l'accès, la rectification ou la suppression de vos données en nous contactant à
            contact@atlasserenity.ma.
          </p>
          <p>
            Cette page sera complétée avec le détail du traitement des données (durée de
            conservation, cookies, base légale) avant la mise en production du site.
          </p>
        </div>
      </div>
    </div>
  )
}
