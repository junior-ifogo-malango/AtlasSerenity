import { useEffect, useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import Header from "../../components/layout/Header"
import { useAuth } from "../../context/AuthContext"
import apiFetch from "../../services/api"
import useAutoGrowTextarea from "../../hooks/useAutoGrowTextarea"

export default function CreerActivite() {
  const { t } = useTranslation()
  const { user } = useAuth()

  const DUREE_UNITES = [
    { value: "minutes", label: t("filters.minutes") },
    { value: "heures", label: t("filters.hours") },
    { value: "jours", label: t("filters.days") },
  ]
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [categoriesError, setCategoriesError] = useState(null)

  const [titre, setTitre] = useState("")
  const [description, setDescription] = useState("")
  const descriptionRef = useAutoGrowTextarea(description)
  const [region, setRegion] = useState("")
  const [prixMad, setPrixMad] = useState("")
  const [dureeValeur, setDureeValeur] = useState("")
  const [dureeUnite, setDureeUnite] = useState("heures")
  const [idCategorie, setIdCategorie] = useState("")

  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchCategories() {
      try {
        const data = await apiFetch("/categories")
        if (!cancelled) {
          setCategories(data ?? [])
          if (data && data.length > 0) {
            setIdCategorie(String(data[0].id))
          }
        }
      } catch {
        if (!cancelled) {
          setCategoriesError(t("operateur.createActivity.loadCategoriesError"))
        }
      }
    }

    fetchCategories()

    return () => {
      cancelled = true
    }
  }, [t])

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== "operateur") {
    return (
      <div className="min-h-screen bg-cream">
        <Header />
        <p className="mx-auto max-w-4xl px-6 py-12 text-ink/70">
          {t("operateur.verification.operatorOnly")}
        </p>
      </div>
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setFieldErrors({})
    setIsSubmitting(true)

    try {
      await apiFetch("/activites", {
        method: "POST",
        body: JSON.stringify({
          titre,
          description,
          region,
          prix_mad: prixMad,
          duree_valeur: dureeValeur,
          duree_unite: dureeUnite,
          id_categorie: idCategorie,
          id_operateur: user.id,
        }),
      })
      navigate("/operateur/dashboard")
    } catch (err) {
      if (err.status === 422 && err.data?.errors) {
        setFieldErrors(err.data.errors)
      } else {
        setError(t("common.genericError"))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-fraunces text-3xl font-semibold leading-snug text-ink mb-8">
          {t("operateur.createActivity.title")}
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border-2 border-cedre bg-white p-6 shadow-sm"
          noValidate
        >
          <div>
            <label htmlFor="titre" className="block text-base font-medium text-ink mb-1">
              {t("operateur.createActivity.titleLabel")}
            </label>
            <input
              id="titre"
              type="text"
              required
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className="w-full rounded-lg border border-ink/15 bg-white px-4 py-2 text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-cedre"
              placeholder={t("operateur.createActivity.titlePlaceholder")}
            />
            {fieldErrors.titre && (
              <p className="mt-1 text-base text-price" role="alert">
                {fieldErrors.titre[0]}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-base font-medium text-ink mb-1">
              {t("operateur.createActivity.description")}
            </label>
            <textarea
              ref={descriptionRef}
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-none overflow-y-auto rounded-lg border border-ink/15 bg-white px-4 py-2 text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-cedre"
              placeholder={t("operateur.createActivity.descriptionPlaceholder")}
            />
            {fieldErrors.description && (
              <p className="mt-1 text-base text-price" role="alert">
                {fieldErrors.description[0]}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="region" className="block text-base font-medium text-ink mb-1">
              {t("operateur.createActivity.region")}
            </label>
            <input
              id="region"
              type="text"
              required
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full rounded-lg border border-ink/15 bg-white px-4 py-2 text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-cedre"
              placeholder={t("operateur.createActivity.regionPlaceholder")}
            />
            {fieldErrors.region && (
              <p className="mt-1 text-base text-price" role="alert">
                {fieldErrors.region[0]}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="id_categorie" className="block text-base font-medium text-ink mb-1">
              {t("operateur.createActivity.category")}
            </label>
            <select
              id="id_categorie"
              required
              value={idCategorie}
              onChange={(e) => setIdCategorie(e.target.value)}
              className="w-full rounded-lg border border-ink/15 bg-white px-4 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-cedre"
            >
              {categories.map((categorie) => (
                <option key={categorie.id} value={categorie.id}>
                  {categorie.nom}
                </option>
              ))}
            </select>
            {categoriesError && (
              <p className="mt-1 text-base text-price" role="alert">
                {categoriesError}
              </p>
            )}
            {fieldErrors.id_categorie && (
              <p className="mt-1 text-base text-price" role="alert">
                {fieldErrors.id_categorie[0]}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="prix_mad" className="block text-base font-medium text-ink mb-1">
                {t("filters.price")}
              </label>
              <input
                id="prix_mad"
                type="number"
                min="0"
                step="0.01"
                required
                value={prixMad}
                onChange={(e) => setPrixMad(e.target.value)}
                className="w-full rounded-lg border border-ink/15 bg-white px-4 py-2 text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-cedre"
                placeholder={t("operateur.createActivity.pricePlaceholder")}
              />
              {fieldErrors.prix_mad && (
                <p className="mt-1 text-base text-price" role="alert">
                  {fieldErrors.prix_mad[0]}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="duree_valeur" className="block text-base font-medium text-ink mb-1">
                {t("filters.duration")}
              </label>
              <input
                id="duree_valeur"
                type="number"
                min="0"
                step="0.5"
                required
                value={dureeValeur}
                onChange={(e) => setDureeValeur(e.target.value)}
                className="w-full rounded-lg border border-ink/15 bg-white px-4 py-2 text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-cedre"
                placeholder={t("operateur.createActivity.durationPlaceholder")}
              />
              {fieldErrors.duree_valeur && (
                <p className="mt-1 text-base text-price" role="alert">
                  {fieldErrors.duree_valeur[0]}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="duree_unite" className="block text-base font-medium text-ink mb-1">
              {t("operateur.createActivity.durationUnit")}
            </label>
            <select
              id="duree_unite"
              value={dureeUnite}
              onChange={(e) => setDureeUnite(e.target.value)}
              className="w-full rounded-lg border border-ink/15 bg-white px-4 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-cedre"
            >
              {DUREE_UNITES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {fieldErrors.duree_unite && (
              <p className="mt-1 text-base text-price" role="alert">
                {fieldErrors.duree_unite[0]}
              </p>
            )}
          </div>

          {error && (
            <p className="text-base text-price" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-cedre px-8 py-3 text-base font-medium text-cream shadow-md transition-colors hover:bg-cedre/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? t("operateur.createActivity.submitting") : t("operateur.createActivity.submit")}
          </button>
        </form>
      </div>
    </div>
  )
}
