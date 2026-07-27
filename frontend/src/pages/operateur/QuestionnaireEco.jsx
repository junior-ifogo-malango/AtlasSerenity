import { useEffect, useState } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import Header from "../../components/layout/Header"
import { useAuth } from "../../context/AuthContext"
import apiFetch from "../../services/api"
import useAutoGrowTextarea from "../../hooks/useAutoGrowTextarea"

const QUESTIONS_OUI_NON = [
  { cle: "limite_participants", texte: "Limitez-vous le nombre de participants par groupe ?" },
  { cle: "materiaux_locaux", texte: "Utilisez-vous des matériaux/produits locaux ?" },
  { cle: "gestion_dechets", texte: "Avez-vous une politique de gestion des déchets ?" },
  {
    cle: "contribution_economique",
    texte: "Votre activité contribue-t-elle économiquement à la communauté locale ?",
  },
  {
    cle: "sensibilisation_environnementale",
    texte: "Sensibilisez-vous les participants aux enjeux environnementaux locaux ?",
  },
  {
    cle: "energies_renouvelables",
    texte: "Utilisez-vous des sources d'énergie renouvelables (si applicable) ?",
  },
]

const QUESTION_TEXTE_LIBRE = {
  cle: "certifications_labels",
  texte: "Avez-vous des certifications ou labels environnementaux existants ?",
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
          Cette page est réservée aux opérateurs.
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
      setError("Merci de répondre Oui ou Non à chaque question avant de valider.")
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
      setError("Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="font-fraunces text-3xl font-semibold leading-snug text-ink mb-1">Questionnaire éco</h1>
        {activite && <p className="text-ink/70 mb-8">{activite.titre}</p>}

        {loadError && (
          <p className="text-price">
            Impossible de charger l&apos;activité pour le moment. Veuillez réessayer plus tard.
          </p>
        )}

        {!loadError && isLoading && <p className="text-ink/70">Chargement...</p>}

        {!loadError && !isLoading && (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border-2 border-cedre bg-white p-6 shadow-sm"
            noValidate
          >
            {QUESTIONS_OUI_NON.map((question, index) => (
              <div key={question.cle} className="rounded-lg border border-ink/15 bg-white p-4">
                <p className="mb-3 text-base font-medium text-ink">
                  {index + 1}. {question.texte}
                </p>

                <div className="mb-3 flex gap-2">
                  {["Oui", "Non"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => updateReponse(question.cle, option)}
                      className={`rounded-full border px-5 py-1.5 text-base font-medium transition-colors ${
                        reponses[question.cle] === option
                          ? "border-cedre bg-cedre text-cream"
                          : "border-ink/15 text-ink hover:border-cedre/50"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={reponses[`${question.cle}_details`]}
                  onChange={(e) => updateReponse(`${question.cle}_details`, e.target.value)}
                  placeholder="Détails (optionnel)"
                  className="w-full rounded-lg border border-ink/15 bg-white px-4 py-2 text-base text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-cedre"
                />
              </div>
            ))}

            <div className="rounded-lg border border-ink/15 bg-white p-4">
              <label
                htmlFor={QUESTION_TEXTE_LIBRE.cle}
                className="mb-3 block text-base font-medium text-ink"
              >
                7. {QUESTION_TEXTE_LIBRE.texte}
              </label>
              <textarea
                ref={texteLibreRef}
                id={QUESTION_TEXTE_LIBRE.cle}
                rows={3}
                value={reponses[QUESTION_TEXTE_LIBRE.cle]}
                onChange={(e) => updateReponse(QUESTION_TEXTE_LIBRE.cle, e.target.value)}
                placeholder="Ex: Label Green Key, certification Clef Verte..."
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
              {isSubmitting ? "Envoi..." : "Envoyer le questionnaire"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
