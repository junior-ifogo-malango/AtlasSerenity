import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import Header from "../../components/layout/Header"
import { useAuth } from "../../context/AuthContext"
import apiFetch from "../../services/api"
import { formatPrixMAD, formatDateDispo, formatHeureDispo } from "../../utils/format"

const STATUT_CLASSNAMES = {
  en_attente: "bg-amber-100 text-amber-800",
  confirmee: "bg-cedre/10 text-cedre",
  annulee: "bg-price/10 text-price",
}

const STATUT_LABEL_KEYS = {
  en_attente: "operateur.dashboard.statutPending",
  confirmee: "voyageur.reservations.statutConfirmed",
  annulee: "voyageur.reservations.statutCancelled",
}

function ReservationCard({ reservation }) {
  const { t, i18n } = useTranslation()
  const statutInfo = STATUT_LABEL_KEYS[reservation.statut]
    ? {
        label: t(STATUT_LABEL_KEYS[reservation.statut]),
        className: STATUT_CLASSNAMES[reservation.statut],
      }
    : {
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
        {formatDateDispo(reservation.disponibilite.date_dispo, i18n.language)}{" "}
        {t("operateur.availability.atTime", { time: formatHeureDispo(reservation.disponibilite.heure_dispo) })}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-ink/10 pt-4 text-base">
        <span className="text-ink/70">
          {t("voyageur.reservations.peopleCount", { count: reservation.nombre_personnes })}
        </span>
        <span className="font-semibold text-price">{formatPrixMAD(reservation.prix_paye, i18n.language)}</span>
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
  const { t } = useTranslation()
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
          {t("nav.myReservations")}
        </h1>

        {error && (
          <p className="text-price">
            {t("voyageur.reservations.loadError")}
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
              {t("voyageur.reservations.empty")}
            </p>
            <Link
              to="/recherche"
              className="rounded-full bg-cedre px-6 py-2.5 text-base font-medium text-cream shadow-sm transition-colors hover:bg-cedre/90"
            >
              {t("search.submit")}
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
