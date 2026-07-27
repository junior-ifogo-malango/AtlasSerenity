import { useEffect, useState } from "react"
import { Navigate, useParams } from "react-router-dom"
import Header from "../../components/layout/Header"
import { useAuth } from "../../context/AuthContext"
import apiFetch from "../../services/api"

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

export default function GererDisponibilites() {
  const { id } = useParams()
  const { user } = useAuth()

  const [activite, setActivite] = useState(null)
  const [disponibilites, setDisponibilites] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const [dateDispo, setDateDispo] = useState("")
  const [heureDispo, setHeureDispo] = useState("")
  const [placesTotales, setPlacesTotales] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!user || user.role !== "operateur") return

    let cancelled = false

    async function fetchData() {
      setIsLoading(true)
      setError(null)
      try {
        const [activiteData, disponibilitesData] = await Promise.all([
          apiFetch(`/activites/${id}`),
          apiFetch(`/disponibilites?id_activite=${id}`),
        ])
        if (!cancelled) {
          setActivite(activiteData)
          setDisponibilites(disponibilitesData ?? [])
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

    fetchData()

    return () => {
      cancelled = true
    }
  }, [id, user])

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

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError(null)
    setFieldErrors({})
    setIsSubmitting(true)

    try {
      const nouvelleDisponibilite = await apiFetch("/disponibilites", {
        method: "POST",
        body: JSON.stringify({
          id_activite: id,
          date_dispo: dateDispo,
          heure_dispo: heureDispo,
          places_totales: placesTotales,
        }),
      })
      setDisponibilites((current) => [...current, nouvelleDisponibilite])
      setDateDispo("")
      setHeureDispo("")
      setPlacesTotales("")
    } catch (err) {
      if (err.status === 422 && err.data?.errors) {
        setFieldErrors(err.data.errors)
      } else {
        setFormError("Une erreur est survenue. Veuillez réessayer.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="font-fraunces text-3xl font-semibold leading-snug text-ink mb-1">
          Gérer les disponibilités
        </h1>
        {activite && <p className="text-ink/70 mb-8">{activite.titre}</p>}

        {error && (
          <p className="text-price">
            Impossible de charger les disponibilités pour le moment. Veuillez réessayer plus tard.
          </p>
        )}

        {!error && isLoading && <p className="text-ink/70">Chargement...</p>}

        {!error && !isLoading && (
          <>
            <div className="mb-8 space-y-3">
              {disponibilites.length === 0 && (
                <p className="text-ink/70">Aucune disponibilité pour cette activité.</p>
              )}

              {disponibilites.map((dispo) => (
                <div
                  key={dispo.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink/10 bg-cream px-4 py-3"
                >
                  <div>
                    <span className="font-medium capitalize text-ink">
                      {formatDateDispo(dispo.date_dispo)}
                    </span>{" "}
                    <span className="text-ink/70">à {formatHeureDispo(dispo.heure_dispo)}</span>
                  </div>
                  <span className="text-base text-ink/70">
                    {dispo.places_restantes} / {dispo.places_totales} places restantes
                  </span>
                </div>
              ))}
            </div>

            <h2 className="text-lg font-semibold text-ink mb-3">Ajouter un créneau</h2>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 rounded-2xl border-2 border-cedre bg-white p-6 shadow-sm"
              noValidate
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date_dispo" className="block text-base font-medium text-ink mb-1">
                    Date
                  </label>
                  <input
                    id="date_dispo"
                    type="date"
                    required
                    value={dateDispo}
                    onChange={(e) => setDateDispo(e.target.value)}
                    className="w-full rounded-lg border border-ink/15 bg-white px-4 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-cedre"
                  />
                  {fieldErrors.date_dispo && (
                    <p className="mt-1 text-base text-price" role="alert">
                      {fieldErrors.date_dispo[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="heure_dispo" className="block text-base font-medium text-ink mb-1">
                    Heure
                  </label>
                  <input
                    id="heure_dispo"
                    type="time"
                    required
                    value={heureDispo}
                    onChange={(e) => setHeureDispo(e.target.value)}
                    className="w-full rounded-lg border border-ink/15 bg-white px-4 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-cedre"
                  />
                  {fieldErrors.heure_dispo && (
                    <p className="mt-1 text-base text-price" role="alert">
                      {fieldErrors.heure_dispo[0]}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="places_totales" className="block text-base font-medium text-ink mb-1">
                  Places totales
                </label>
                <input
                  id="places_totales"
                  type="number"
                  min="1"
                  required
                  value={placesTotales}
                  onChange={(e) => setPlacesTotales(e.target.value)}
                  className="w-full max-w-[10rem] rounded-lg border border-ink/15 bg-white px-4 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-cedre"
                  placeholder="10"
                />
                {fieldErrors.places_totales && (
                  <p className="mt-1 text-base text-price" role="alert">
                    {fieldErrors.places_totales[0]}
                  </p>
                )}
              </div>

              {formError && (
                <p className="text-base text-price" role="alert">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-cedre px-8 py-3 text-base font-medium text-cream shadow-md transition-colors hover:bg-cedre/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Ajout..." : "Ajouter le créneau"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
