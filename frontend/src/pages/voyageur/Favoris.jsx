import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import Header from "../../components/layout/Header"
import ActiviteCard from "../../components/ui/ActiviteCard"
import { useAuth } from "../../context/AuthContext"
import apiFetch from "../../services/api"

function ActiviteCardSkeleton() {
  return (
    <div className="flex animate-pulse gap-4 rounded-2xl border border-ink/10 bg-cream p-3">
      <div className="h-24 w-32 shrink-0 rounded-xl bg-ink/10 sm:h-28 sm:w-40" />
      <div className="flex flex-1 flex-col justify-center space-y-3 py-1">
        <div className="h-5 w-3/4 rounded bg-ink/10" />
        <div className="h-4 w-1/2 rounded bg-ink/10" />
        <div className="h-5 w-1/3 rounded bg-ink/10" />
      </div>
    </div>
  )
}

export default function Favoris() {
  const { user } = useAuth()
  const [favoris, setFavoris] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) return

    let cancelled = false

    async function fetchFavoris() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await apiFetch(`/favoris?id_voyageur=${user.id}`)
        if (!cancelled) {
          setFavoris(data ?? [])
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

    fetchFavoris()

    return () => {
      cancelled = true
    }
  }, [user])

  if (!user) {
    return <Navigate to="/login" replace />
  }

  function handleToggleFavori(activiteId, estFavoriMaintenant) {
    // Le retrait se fait désormais via le cœur de l'ActiviteCard (avec sa
    // propre confirmation) : on synchronise juste la liste affichée ici.
    if (estFavoriMaintenant) return
    setFavoris((current) => current.filter((favori) => favori.activite.id !== activiteId))
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <section className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="font-fraunces text-2xl font-semibold text-ink mb-6">
          Mes favoris
        </h1>

        {error && (
          <p className="text-price">
            Impossible de charger vos favoris pour le moment. Veuillez réessayer plus tard.
          </p>
        )}

        {!error && isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <ActiviteCardSkeleton key={index} />
            ))}
          </div>
        )}

        {!error && !isLoading && favoris.length === 0 && (
          <p className="text-ink/70">Vous n&apos;avez pas encore de favoris.</p>
        )}

        {!error && !isLoading && favoris.length > 0 && (
          <div className="space-y-4">
            {favoris.map((favori) => (
              <ActiviteCard
                key={favori.id}
                activite={favori.activite}
                estFavori
                variant="liste"
                onToggleFavori={handleToggleFavori}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
