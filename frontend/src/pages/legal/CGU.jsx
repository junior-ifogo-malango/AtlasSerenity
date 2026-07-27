import Header from "../../components/layout/Header"

export default function CGU() {
  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="mb-8 font-fraunces text-3xl font-semibold leading-snug text-ink">
          Conditions générales d'utilisation
        </h1>

        <div className="space-y-4 text-base text-ink/80">
          <p>
            L'utilisation de la plateforme AtlasSerenity implique l'acceptation pleine et entière
            des présentes conditions générales d'utilisation.
          </p>
          <p>
            AtlasSerenity met en relation des voyageurs et des opérateurs d'activités
            touristiques. Chaque réservation effectuée via la plateforme engage directement le
            voyageur et l'opérateur concerné.
          </p>
          <p>
            Cette page sera complétée avec le détail des conditions d'utilisation (inscription,
            réservations, paiements, responsabilités) avant la mise en production du site.
          </p>
        </div>
      </div>
    </div>
  )
}
