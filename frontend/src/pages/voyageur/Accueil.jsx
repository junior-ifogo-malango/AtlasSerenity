import { useEffect, useState } from "react"
import Header from "../../components/layout/Header"
import Hero from "../../components/ui/Hero"
import ActiviteCard from "../../components/ui/ActiviteCard"
import FiltresBar from "../../components/ui/FiltresBar"
import { useAuth } from "../../context/AuthContext"
import apiFetch from "../../services/api"

function ActiviteCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-ink/10 bg-cream overflow-hidden">
      <div className="h-48 w-full bg-ink/10" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-3/4 rounded bg-ink/10" />
        <div className="h-4 w-1/2 rounded bg-ink/10" />
        <div className="h-5 w-1/3 rounded bg-ink/10" />
      </div>
    </div>
  )
}

export default function Accueil() {
  const { user } = useAuth()
  const [activites, setActivites] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategorieId, setSelectedCategorieId] = useState(null)
  const [favorisIds, setFavorisIds] = useState(new Set())

  useEffect(() => {
    if (!user) {
      setFavorisIds(new Set())
      return
    }

    let cancelled = false

    apiFetch(`/favoris?id_voyageur=${user.id}`)
      .then((data) => {
        if (!cancelled) {
          setFavorisIds(new Set((data ?? []).map((favori) => favori.id_activite)))
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFavorisIds(new Set())
        }
      })

    return () => {
      cancelled = true
    }
  }, [user])

  useEffect(() => {
    let cancelled = false

    async function fetchActivites() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await apiFetch(
          selectedCategorieId === null
            ? "/activites"
            : `/activites?id_categorie=${selectedCategorieId}`
        )
        if (!cancelled) {
          setActivites(data ?? [])
        }
      } catch (err) {
        if (!cancelled) {
          setError(err)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchActivites()

    return () => {
      cancelled = true
    }
  }, [selectedCategorieId])

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <Hero />
      <FiltresBar
        selectedCategorieId={selectedCategorieId}
        onSelectCategorie={setSelectedCategorieId}
      />

      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="font-fraunces text-2xl font-semibold text-ink mb-6">
          Activités populaires
        </h2>

        {error && (
          <p className="text-price">
            Impossible de charger les activités pour le moment. Veuillez réessayer plus tard.
          </p>
        )}

        {!error && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <ActiviteCardSkeleton key={index} />
                ))
              : activites.map((activite) => (
                  <ActiviteCard
                    key={activite.id}
                    activite={activite}
                    estFavori={favorisIds.has(activite.id)}
                  />
                ))}
          </div>
        )}
      </section>
    </div>
  )
}
