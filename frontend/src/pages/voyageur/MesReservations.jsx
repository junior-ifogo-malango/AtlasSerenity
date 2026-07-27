import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Header from "../../components/layout/Header"
import { useAuth } from "../../context/AuthContext"
import apiFetch from "../../services/api"

const STATUTS = {
  en_attente: { label: "En attente", className: "bg-amber-100 text-amber-800" },
  confirmee: { label: "Confirmée", className: "bg-cedre/10 text-cedre" },
  annulee: { label: "Annulée", className: "bg-price/10 text-price" },
}

function formatPrixMAD(prix) {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0,
  }).format(prix)
}

function formatDateDispo(dateDispo) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${dateDispo}T00:00:00`))
}

function formatHeureDispo(heureDispo) {
  return heureDispo.slice(0, 5)
}

function ReservationCard({ reservation }) {
  const statutInfo = STATUTS[reservation.statut] ?? {
    label: reservation.statut,
    className: "bg-ink/10 text-ink",
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-cream p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-fraunces text-lg font-semibold text-ink leading-snug">
          {reservation.activite.titre}
        </h3>
        <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium ${statutInfo.className}`}>
          {statutInfo.label}
        </span>
      </div>

      <p className="mt-2 text-base text-ink/70">
        {formatDateDispo(reservation.disponibilite.date_dispo)} à{" "}
        {formatHeureDispo(reservation.disponibilite.heure_dispo)}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-ink/10 pt-4 text-base">
        <span className="text-ink/70">
          {reservation.nombre_personnes} personne{reservation.nombre_personnes > 1 ? "s" : ""}
        </span>
        <span className="font-semibold text-price">{formatPrixMAD(reservation.prix_paye)}</span>
      </div>

      <p className="mt-2 text-sm text-ink/50">N° {reservation.numero_reservation}</p>
    </div>
  )
}

function ReservationCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-ink/10 bg-cream p-5">
      <div className="h-5 w-2/3 rounded bg-ink/10" />
      <div className="mt-3 h-4 w-1/2 rounded bg-ink/10" />
      <div className="mt-6 h-4 w-1/3 rounded bg-ink/10" />
    </div>
  )
}

export default function MesReservations() {
  const { user } = useAuth()
  const [reservations, setReservations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      setReservations([])
      setIsLoading(false)
      return
    }

    let cancelled = false

    async function fetchReservations() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await apiFetch(`/reservations?id_voyageur=${user.id}`)
        if (!cancelled) {
          setReservations(data ?? [])
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

    fetchReservations()

    return () => {
      cancelled = true
    }
  }, [user])

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <section className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="font-fraunces text-2xl font-semibold text-ink mb-6">
          Mes réservations
        </h1>

        {error && (
          <p className="text-price">
            Impossible de charger vos réservations pour le moment. Veuillez réessayer plus tard.
          </p>
        )}

        {!error && isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <ReservationCardSkeleton key={index} />
            ))}
          </div>
        )}

        {!error && !isLoading && reservations.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="font-fraunces text-2xl font-semibold text-ink">
              Aucune réservation dans votre panier
            </p>
            <Link
              to="/recherche"
              className="rounded-full bg-cedre px-6 py-2.5 text-base font-medium text-cream shadow-sm transition-colors hover:bg-cedre/90"
            >
              Trouver une activité
            </Link>
          </div>
        )}

        {!error && !isLoading && reservations.length > 0 && (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
