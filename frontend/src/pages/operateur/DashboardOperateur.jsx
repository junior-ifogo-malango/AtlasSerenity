import { useEffect, useState } from "react"
import { Link, Navigate } from "react-router-dom"
import Header from "../../components/layout/Header"
import { useAuth } from "../../context/AuthContext"
import apiFetch from "../../services/api"

const STATUTS = {
  publie: { label: "Publiée", className: "bg-cedre/10 text-cedre" },
  en_attente: { label: "En attente", className: "bg-amber-100 text-amber-800" },
  refuse: { label: "Refusée", className: "bg-price/10 text-price" },
}

function formatPrixMAD(prix) {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0,
  }).format(prix)
}

function ActiviteRow({ activite }) {
  const statutInfo = STATUTS[activite.statut] ?? {
    label: activite.statut,
    className: "bg-ink/10 text-ink",
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ink/10 bg-cream p-5 shadow-sm">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <h3 className="font-fraunces text-lg font-semibold text-ink truncate">
            {activite.titre}
          </h3>
          <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium ${statutInfo.className}`}>
            {statutInfo.label}
          </span>
        </div>
        <p className="mt-1 text-base text-ink/70">
          {activite.region} · {formatPrixMAD(activite.prix_mad)}
        </p>
      </div>

      <div className="grid w-full grid-cols-2 gap-2 text-base sm:flex sm:w-auto sm:shrink-0 sm:items-center sm:gap-3">
        <Link
          to={`/operateur/activites/${activite.id}/modifier`}
          className="rounded-full border border-cedre px-4 py-2 text-center font-medium text-cedre transition-colors hover:bg-cedre hover:text-cream sm:rounded-none sm:border-0 sm:px-0 sm:py-0 sm:hover:bg-transparent sm:hover:text-cedre sm:hover:underline"
        >
          Modifier
        </Link>
        <Link
          to={`/operateur/activites/${activite.id}/disponibilites`}
          className="rounded-full border border-cedre px-4 py-2 text-center font-medium text-cedre transition-colors hover:bg-cedre hover:text-cream"
        >
          Gérer les disponibilités
        </Link>
        <Link
          to={`/operateur/activites/${activite.id}/photos`}
          className="rounded-full border border-cedre px-4 py-2 text-center font-medium text-cedre transition-colors hover:bg-cedre hover:text-cream"
        >
          Gérer les photos
        </Link>
        <Link
          to={`/operateur/activites/${activite.id}/questionnaire-eco`}
          className="rounded-full border border-cedre px-4 py-2 text-center font-medium text-cedre transition-colors hover:bg-cedre hover:text-cream"
        >
          Questionnaire éco
        </Link>
      </div>
    </div>
  )
}

function ActiviteRowSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-ink/10 bg-cream p-5">
      <div className="h-5 w-1/2 rounded bg-ink/10" />
      <div className="mt-3 h-4 w-1/3 rounded bg-ink/10" />
    </div>
  )
}

export default function DashboardOperateur() {
  const { user } = useAuth()
  const [activites, setActivites] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user || user.role !== "operateur") return

    let cancelled = false

    async function fetchActivites() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await apiFetch(`/activites?id_operateur=${user.id}`)
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
  }, [user])

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== "operateur") {
    return (
      <div className="min-h-screen bg-cream">
        <Header />
        <p className="mx-auto max-w-4xl px-6 py-12 text-ink/70">
          Cette page est réservée aux opérateurs.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-fraunces text-2xl font-semibold text-ink">
            Mes activités
          </h1>
          <Link
            to="/operateur/activites/nouvelle"
            className="rounded-full bg-cedre px-6 py-3 text-base font-medium text-cream shadow-md transition-colors hover:bg-cedre/90"
          >
            Créer une activité
          </Link>
        </div>

        {error && (
          <p className="text-price">
            Impossible de charger vos activités pour le moment. Veuillez réessayer plus tard.
          </p>
        )}

        {!error && isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <ActiviteRowSkeleton key={index} />
            ))}
          </div>
        )}

        {!error && !isLoading && activites.length === 0 && (
          <p className="text-ink/70">Vous n'avez pas encore créé d'activité.</p>
        )}

        {!error && !isLoading && activites.length > 0 && (
          <div className="space-y-4">
            {activites.map((activite) => (
              <ActiviteRow key={activite.id} activite={activite} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
