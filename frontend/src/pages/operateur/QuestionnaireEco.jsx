import { useEffect, useState } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import Header from "../../components/layout/Header"
import { useAuth } from "../../context/AuthContext"
import apiFetch from "../../services/api"
import useAutoGrowTextarea from "../../hooks/useAutoGrowTextarea"

const QUESTIONS_OUI_NON = [
  { cle: "limite_participants", texteKey: "operateur.ecoQuestionnaire.limitParticipants" },
  { cle: "materiaux_locaux", texteKey: "operateur.ecoQuestionnaire.localMaterials" },
  { cle: "gestion_dechets", texteKey: "operateur.ecoQuestionnaire.wasteManagement" },
  { cle: "contribution_economique", texteKey: "operateur.ecoQuestionnaire.economicContribution" },
  { cle: "sensibilisation_environnementale", texteKey: "operateur.ecoQuestionnaire.environmentalAwareness" },
  { cle: "energies_renouvelables", texteKey: "operateur.ecoQuestionnaire.renewableEnergy" },
]

const QUESTION_TEXTE_LIBRE = {
  cle: "certifications_labels",
  texteKey: "operateur.ecoQuestionnaire.certifications",
}

function reponsesInitiales() {
  const initial = {}
  QUESTIONS_OUI_NON.forEach((question) => {
    initial[question.cle] = ""
    initial[`${question.cle}_details`] = ""
  })
  initial[QUESTION_TEXTE_LIBRE.cle] = ""
  return initial
}

export default function QuestionnaireEco() {
  const { t } = useTranslation()
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [activite, setActivite] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const [reponses, setReponses] = useState(reponsesInitiales)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const texteLibreRef = useAutoGrowTextarea(reponses[QUESTION_TEXTE_LIBRE.cle])

  useEffect(() => {
    if (!user || user.role !== "operateur") return

    let cancelled = false

    async function fetchActivite() {
      setIsLoading(true)
      setLoadError(null)
      try {
        const data = await apiFetch(`/activites/${id}`)
        if (!cancelled) {
          setActivite(data)
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchActivite()

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
          {t("operateur.verification.operatorOnly")}
        </p>
      </div>
    )
  }

  function updateReponse(cle, valeur) {
    setReponses((current) => ({ ...current, [cle]: valeur }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)

    const reponseManquante = QUESTIONS_OUI_NON.some((question) => !reponses[question.cle])
    if (reponseManquante) {
      setError(t("operateur.ecoQuestionnaire.missingAnswer"))
      return
    }

    setIsSubmitting(true)
    try {
      await apiFetch("/questionnaires-eco", {
        method: "POST",
        body: JSON.stringify({ id_activite: id, reponses }),
      })
      navigate("/operateur/dashboard")
    } catch {
      setError(t("common.genericError"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="font-fraunces text-3xl font-semibold leading-snug text-ink mb-1">{t("admin.validation.ecoQuestionnaire")}</h1>
        {activite && <p className="text-ink/70 mb-8">{activite.titre}</p>}

        {loadError && (
          <p className="text-price">
            {t("operateur.ecoQuestionnaire.loadError")}
          </p>
        )}

        {!loadError && isLoading && <p className="text-ink/70">{t("common.loading")}</p>}

        {!loadError && !isLoading && (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border-2 border-cedre bg-white p-6 shadow-sm"
            noValidate
          >
            {QUESTIONS_OUI_NON.map((question, index) => (
              <div key={question.cle} className="rounded-lg border border-ink/15 bg-white p-4">
                <p className="mb-3 text-base font-medium text-ink">
                  {index + 1}. {t(question.texteKey)}
                </p>

                <div className="mb-3 flex gap-2">
                  {[
                    { value: "Oui", labelKey: "operateur.ecoQuestionnaire.yes" },
                    { value: "Non", labelKey: "operateur.ecoQuestionnaire.no" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateReponse(question.cle, option.value)}
                      className={`rounded-full border px-5 py-1.5 text-base font-medium transition-colors ${
                        reponses[question.cle] === option.value
                          ? "border-cedre bg-cedre text-cream"
                          : "border-ink/15 text-ink hover:border-cedre/50"
                      }`}
                    >
                      {t(option.labelKey)}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={reponses[`${question.cle}_details`]}
                  onChange={(e) => updateReponse(`${question.cle}_details`, e.target.value)}
                  placeholder={t("operateur.ecoQuestionnaire.detailsPlaceholder")}
                  className="w-full rounded-lg border border-ink/15 bg-white px-4 py-2 text-base text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-cedre"
                />
              </div>
            ))}

            <div className="rounded-lg border border-ink/15 bg-white p-4">
              <label
                htmlFor={QUESTION_TEXTE_LIBRE.cle}
                className="mb-3 block text-base font-medium text-ink"
              >
                7. {t(QUESTION_TEXTE_LIBRE.texteKey)}
              </label>
              <textarea
                ref={texteLibreRef}
                id={QUESTION_TEXTE_LIBRE.cle}
                rows={3}
                value={reponses[QUESTION_TEXTE_LIBRE.cle]}
                onChange={(e) => updateReponse(QUESTION_TEXTE_LIBRE.cle, e.target.value)}
                placeholder={t("operateur.ecoQuestionnaire.certificationsPlaceholder")}
                className="w-full resize-none overflow-y-auto rounded-lg border border-ink/15 bg-white px-4 py-2 text-base text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-cedre"
              />
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
              {isSubmitting ? t("common.sending") : t("operateur.ecoQuestionnaire.submit")}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
