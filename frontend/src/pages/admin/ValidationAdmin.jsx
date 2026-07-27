import { useEffect, useState } from "react"
import { Link, Navigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { CheckCircle } from "lucide-react"
import Header from "../../components/layout/Header"
import { useAuth } from "../../context/AuthContext"
import apiFetch, { API_BASE_URL } from "../../services/api"
import {
  TYPES_REQUIS,
  LABELS_DOCUMENT,
  STATUT_DOCUMENT_CLASSNAMES,
  STATUTS_DOCUMENT_LABEL_KEYS_ADMIN,
} from "../../constants/operateur"
import { formatPrixMAD } from "../../utils/format"

const STORAGE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "")

const ROLES = {
  voyageur: "auth.register.roleVoyageur",
  operateur: "auth.register.roleOperateur",
  admin: "admin.validation.roleAdmin",
}

function formatLabelReponse(cle) {
  return cle.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase())
}

function EtatVide({ message }) {
  return (
    <div className="flex items-center gap-2 text-ink/70">
      <CheckCircle className="h-5 w-5 shrink-0 text-cedre" strokeWidth={1.75} aria-hidden="true" />
      <p>{message}</p>
    </div>
  )
}

async function ouvrirDocument(documentId) {
  const token = localStorage.getItem("token")
  const response = await fetch(`${API_BASE_URL}/documents-operateur/${documentId}/fichier`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) return
  const blob = await response.blob()
  window.open(URL.createObjectURL(blob), "_blank")
}

function DocumentReviewRow({ type, document, onReview }) {
  const { t } = useTranslation()
  const [commentaire, setCommentaire] = useState("")
  const [showRefusForm, setShowRefusForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const statutInfo = document
    ? {
        label: t(STATUTS_DOCUMENT_LABEL_KEYS_ADMIN[document.statut]),
        className: STATUT_DOCUMENT_CLASSNAMES[document.statut],
      }
    : null

  async function handleValider() {
    setIsSubmitting(true)
    try {
      await onReview(document.id, { statut: "valide" })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRefuser() {
    setIsSubmitting(true)
    try {
      await onReview(document.id, { statut: "refuse", commentaire_admin: commentaire || null })
      setShowRefusForm(false)
      setCommentaire("")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-lg border border-ink/10 bg-white px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium text-ink">{t(LABELS_DOCUMENT[type])}</p>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${statutInfo?.className ?? "bg-ink/10 text-ink/60"}`}
          >
            {statutInfo?.label ?? t("operateur.documentStatus.notSent")}
          </span>

          {document && (
            <>
              <button
                type="button"
                onClick={() => ouvrirDocument(document.id)}
                className="text-sm font-medium text-cedre hover:underline"
              >
                {t("admin.validation.view")}
              </button>

              {document.statut !== "valide" && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleValider}
                  className="rounded-full bg-cedre px-3 py-1 text-sm font-medium text-cream transition-colors hover:bg-cedre/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t("admin.validation.approve")}
                </button>
              )}

              {document.statut !== "refuse" && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowRefusForm((current) => !current)}
                  className="rounded-full border border-argile px-3 py-1 text-sm font-medium text-argile transition-colors hover:bg-argile hover:text-cream disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t("admin.validation.reject")}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {document?.statut === "refuse" && document.commentaire_admin && (
        <p className="mt-2 text-sm text-ink/70">
          <span className="font-medium">{t("admin.validation.reasonGivenLabel")}</span>
          {document.commentaire_admin}
        </p>
      )}

      {showRefusForm && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={commentaire}
            onChange={(event) => setCommentaire(event.target.value)}
            placeholder={t("admin.validation.rejectReasonPlaceholder")}
            className="min-w-[220px] flex-1 rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-cedre"
          />
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleRefuser}
            className="rounded-full bg-argile px-4 py-1.5 text-sm font-medium text-cream transition-colors hover:bg-argile/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t("admin.validation.confirmRejection")}
          </button>
        </div>
      )}
    </div>
  )
}

function DocumentsOperateur({ compte }) {
  const { t } = useTranslation()
  const [documents, setDocuments] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    apiFetch(`/documents-operateur?id_utilisateur=${compte.id}`)
      .then((data) => {
        if (!cancelled) setDocuments(data ?? [])
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })

    return () => {
      cancelled = true
    }
  }, [compte.id])

  async function handleReview(documentId, payload) {
    const updated = await apiFetch(`/admin/documents-operateur/${documentId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
    setDocuments((current) => current.map((doc) => (doc.id === documentId ? updated : doc)))
  }

  const typesRequis = TYPES_REQUIS[compte.type_operateur] ?? []

  if (error) {
    return <p className="mt-3 text-sm text-argile">{t("admin.validation.cannotLoadDocuments")}</p>
  }

  if (documents === null) {
    return <p className="mt-3 text-sm text-ink/50">{t("admin.validation.loadingDocuments")}</p>
  }

  return (
    <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
      {typesRequis.map((type) => (
        <DocumentReviewRow
          key={type}
          type={type}
          document={documents.find((doc) => doc.type_document === type)}
          onReview={handleReview}
        />
      ))}
    </div>
  )
}

function CompteAValider({ compte, onValide }) {
  const { t } = useTranslation()
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState(null)

  async function handleValider() {
    setIsValidating(true)
    setError(null)
    try {
      await apiFetch(`/admin/users/${compte.id}/valider-compte`, { method: "PUT" })
      onValide(compte.id)
    } catch (err) {
      const documentsManquants = err.data?.documents_manquants
      setError(
        documentsManquants?.length
          ? t("admin.validation.missingDocuments", {
              list: documentsManquants
                .map((type) => (LABELS_DOCUMENT[type] ? t(LABELS_DOCUMENT[type]) : type))
                .join(", "),
            })
          : t("admin.validation.cannotValidateAccount")
      )
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <div className="rounded-lg border border-ink/10 bg-white px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium text-ink">{compte.name}</p>
          <p className="text-base text-ink/70">
            {compte.email} · {ROLES[compte.role] ? t(ROLES[compte.role]) : compte.role}
          </p>
          {compte.role === "operateur" && (
            <Link
              to={`/recherche?id_operateur=${compte.id}`}
              className="mt-1 inline-block text-sm font-medium text-cedre hover:underline"
            >
              {t("admin.validation.viewOtherActivities")}
            </Link>
          )}
        </div>
        <button
          type="button"
          disabled={isValidating}
          onClick={handleValider}
          className="rounded-full bg-cedre px-5 py-2 text-sm font-medium text-cream shadow-sm transition-colors hover:bg-cedre/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isValidating ? "..." : t("admin.validation.validateAccount")}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-sm text-argile" role="alert">
          {error}
        </p>
      )}

      {compte.role === "operateur" && <DocumentsOperateur compte={compte} />}
    </div>
  )
}

function ComptesAValider({ comptes, onValide }) {
  const { t } = useTranslation()
  if (comptes.length === 0) {
    return <EtatVide message={t("admin.validation.noAccountsPending")} />
  }

  return (
    <div className="space-y-3">
      {comptes.map((compte) => (
        <CompteAValider key={compte.id} compte={compte} onValide={onValide} />
      ))}
    </div>
  )
}

function ActiviteAValiderCard({ activite, onValider, validatingId }) {
  const { t, i18n } = useTranslation()
  const [questionnaire, setQuestionnaire] = useState(undefined)
  const [isValidatingQuestionnaire, setIsValidatingQuestionnaire] = useState(false)
  const [questionnaireError, setQuestionnaireError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchQuestionnaire() {
      try {
        const data = await apiFetch(`/questionnaires-eco?id_activite=${activite.id}`)
        if (!cancelled) {
          setQuestionnaire(data?.[0] ?? null)
        }
      } catch {
        if (!cancelled) {
          setQuestionnaire(null)
        }
      }
    }

    fetchQuestionnaire()

    return () => {
      cancelled = true
    }
  }, [activite.id])

  async function handleValiderQuestionnaire() {
    setIsValidatingQuestionnaire(true)
    setQuestionnaireError(null)
    try {
      const updated = await apiFetch(`/questionnaires-eco/${questionnaire.id}`, {
        method: "PUT",
        body: JSON.stringify({ valide_par_admin: true }),
      })
      setQuestionnaire(updated)
    } catch {
      setQuestionnaireError(t("admin.validation.cannotValidateQuestionnaire"))
    } finally {
      setIsValidatingQuestionnaire(false)
    }
  }

  return (
    <div className="rounded-lg border border-ink/10 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-[240px] flex-1">
          <p className="font-medium text-ink">{activite.titre}</p>
          <p className="text-base text-ink/70">{activite.operateur?.name}</p>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-ink/70">
            {activite.categorie?.nom && <span>{activite.categorie.nom}</span>}
            <span>{activite.region}</span>
            <span className="font-semibold text-price">{formatPrixMAD(activite.prix_mad, i18n.language)}</span>
          </div>

          {activite.description && (
            <p className="mt-2 text-base text-ink/70">{activite.description}</p>
          )}

          {activite.photos?.length > 0 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {activite.photos.map((photo) => (
                <img
                  key={photo.id}
                  src={`${STORAGE_BASE_URL}/storage/${photo.chemin}`}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-md object-cover"
                />
              ))}
            </div>
          )}

          {questionnaire === undefined && (
            <p className="mt-3 text-base text-ink/50">{t("admin.validation.loadingQuestionnaire")}</p>
          )}

          {questionnaire === null && (
            <p className="mt-3 text-base text-ink/50">{t("admin.validation.noQuestionnaire")}</p>
          )}

          {questionnaire && (
            <div className="mt-3 rounded-lg border border-cedre/20 bg-cedre/5 p-3">
              <p className="mb-2 text-base font-medium text-ink">
                {t("admin.validation.ecoQuestionnaire")}
                {questionnaire.valide_par_admin && (
                  <span className="ml-2 text-sm font-normal text-cedre">{t("admin.validation.validated")}</span>
                )}
              </p>
              <dl className="space-y-1 text-base text-ink/80">
                {Object.entries(questionnaire.reponses)
                  .filter(([, valeur]) => valeur !== null && valeur !== "")
                  .map(([cle, valeur]) => (
                    <div key={cle} className="flex flex-wrap gap-x-2">
                      <dt className="font-medium text-ink/60">{formatLabelReponse(cle)} :</dt>
                      <dd>{String(valeur)}</dd>
                    </div>
                  ))}
              </dl>
              {questionnaireError && (
                <p className="mt-2 text-base text-price">{questionnaireError}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-2">
          <button
            type="button"
            disabled={validatingId === activite.id}
            onClick={() => onValider(activite.id)}
            className="rounded-full bg-cedre px-5 py-2 text-sm font-medium text-cream shadow-sm transition-colors hover:bg-cedre/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {validatingId === activite.id ? "..." : t("admin.validation.validateActivity")}
          </button>

          {questionnaire && !questionnaire.valide_par_admin && (
            <button
              type="button"
              disabled={isValidatingQuestionnaire}
              onClick={handleValiderQuestionnaire}
              className="rounded-full border border-cedre px-5 py-2 text-sm font-medium text-cedre transition-colors hover:bg-cedre hover:text-cream disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isValidatingQuestionnaire ? "..." : t("admin.validation.validateQuestionnaire")}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function ActivitesAValider({ activites, onValider, validatingId }) {
  const { t } = useTranslation()
  if (activites.length === 0) {
    return <EtatVide message={t("admin.validation.noActivitiesPending")} />
  }

  return (
    <div className="space-y-3">
      {activites.map((activite) => (
        <ActiviteAValiderCard
          key={activite.id}
          activite={activite}
          onValider={onValider}
          validatingId={validatingId}
        />
      ))}
    </div>
  )
}

export default function ValidationAdmin() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [comptes, setComptes] = useState([])
  const [activites, setActivites] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [validatingId, setValidatingId] = useState(null)

  useEffect(() => {
    if (!user || user.role !== "admin") return

    let cancelled = false

    async function fetchDonnees() {
      setIsLoading(true)
      setError(null)
      try {
        const [comptesData, activitesData] = await Promise.all([
          apiFetch("/users?statut_compte=en_attente"),
          apiFetch("/activites?statut=en_attente"),
        ])
        if (!cancelled) {
          setComptes(comptesData ?? [])
          setActivites(activitesData ?? [])
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

    fetchDonnees()

    return () => {
      cancelled = true
    }
  }, [user])

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-cream">
        <Header />
        <p className="mx-auto max-w-4xl px-6 py-12 text-ink/70">
          {t("admin.validation.adminOnly")}
        </p>
      </div>
    )
  }

  function handleCompteValide(id) {
    setComptes((current) => current.filter((compte) => compte.id !== id))
  }

  async function handleValiderActivite(id) {
    setValidatingId(id)
    try {
      await apiFetch(`/admin/activites/${id}/valider`, { method: "PUT" })
      setActivites((current) => current.filter((activite) => activite.id !== id))
    } catch {
      setError(new Error(t("admin.validation.cannotValidateActivity")))
    } finally {
      setValidatingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <div className="mx-auto max-w-full px-6 py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-fraunces text-3xl font-semibold leading-snug text-ink">{t("admin.validation.title")}</h1>
          <Link
            to="/admin/dashboard"
            className="rounded-full bg-cedre px-6 py-3 text-sm font-medium text-cream shadow-sm transition-colors hover:bg-cedre/90"
          >
            {t("admin.validation.crmDashboardLink")}
          </Link>
        </div>

        {error && (
          <p className="mb-6 text-price" role="alert">
            {t("common.genericError")}
          </p>
        )}

        {isLoading ? (
          <p className="text-ink/70">{t("admin.validation.loading")}</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <section className="rounded-2xl border border-ink/10 bg-cream p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-ink mb-4">{t("admin.validation.accountsTitle")}</h2>
              <ComptesAValider comptes={comptes} onValide={handleCompteValide} />
            </section>

            <section className="rounded-2xl border border-ink/10 bg-cream p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-ink mb-4">{t("admin.validation.activitiesTitle")}</h2>
              <ActivitesAValider
                activites={activites}
                onValider={handleValiderActivite}
                validatingId={validatingId}
              />
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
