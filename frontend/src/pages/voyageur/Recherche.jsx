import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import Header from "../../components/layout/Header"
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

export default function Recherche() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get("q") ?? ""
  const idOperateur = searchParams.get("id_operateur")
  const [inputValue, setInputValue] = useState(q)
  const [activites, setActivites] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategorieId, setSelectedCategorieId] = useState(null)
  const [favorisIds, setFavorisIds] = useState(new Set())

  useEffect(() => {
    setInputValue(q)
  }, [q])

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
    const timeout = setTimeout(() => {
      if (inputValue !== q) {
        setSearchParams(inputValue ? { q: inputValue } : {})
      }
    }, 400)

    return () => clearTimeout(timeout)
  }, [inputValue])

  useEffect(() => {
    let cancelled = false

    async function fetchActivites() {
      setIsLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (q) {
          params.set("q", q)
        }
        if (selectedCategorieId !== null) {
          params.set("id_categorie", selectedCategorieId)
        }
        if (idOperateur) {
          params.set("id_operateur", idOperateur)
        }

        // Laravel/PHP ne parse une clé répétée comme tableau que si elle porte
        // le suffixe [] dans la query string ; sans ça la validation "array" échoue.
        searchParams.getAll("categories").forEach((id) => params.append("categories[]", id))
        searchParams.getAll("villes").forEach((nom) => params.append("villes[]", nom))
        searchParams.getAll("heure_debut").forEach((valeur) => params.append("heure_debut[]", valeur))
        ;["duree_unite", "duree_min", "duree_max", "prix_min", "prix_max", "note_min"].forEach(
          (cle) => {
            const valeur = searchParams.get(cle)
            if (valeur) {
              params.set(cle, valeur)
            }
          }
        )

        const query = params.toString()

        const data = await apiFetch(`/activites${query ? `?${query}` : ""}`)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, selectedCategorieId, idOperateur, searchParams.toString()])

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <FiltresBar selectedCategorieId={selectedCategorieId} onSelectCategorie={setSelectedCategorieId} />

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-6 flex w-full max-w-md items-center gap-2 rounded-full border border-ink/15 bg-white px-4 py-2 text-ink/60 shadow-sm">
          <svg
            className="h-4 w-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder={t("search.placeholder")}
            className="w-full bg-transparent text-base text-ink placeholder:text-ink/60 focus:outline-none"
          />
        </div>

        <h2 className="font-fraunces text-2xl font-semibold text-ink mb-6">
          {idOperateur
            ? t("voyageur.search.operatorActivities")
            : q
              ? t("voyageur.search.resultsForQuery", { query: q })
              : t("voyageur.search.allActivities")}
        </h2>

        {error && (
          <p className="text-price">
            {t("voyageur.home.loadError")}
          </p>
        )}

        {!error && !isLoading && activites.length === 0 && (
          <p className="text-ink/70">{t("voyageur.search.noResults")}</p>
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
