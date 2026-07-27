import Header from "../../components/layout/Header"

export default function MentionsLegales() {
  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="mb-8 font-fraunces text-3xl font-semibold leading-snug text-ink">
          Mentions légales
        </h1>

        <div className="space-y-4 text-base text-ink/80">
          <p>
            AtlasSerenity est une plateforme de mise en relation entre voyageurs et opérateurs
            d'activités touristiques au Maroc.
          </p>
          <p>
            Éditeur : AtlasSerenity — Contact : contact@atlasserenity.ma
          </p>
          <p>
            Cette page sera complétée avec les informations légales complètes (raison sociale,
            forme juridique, siège social, numéro d'immatriculation, hébergeur) avant la mise en
            production du site.
          </p>
        </div>
      </div>
    </div>
  )
}
