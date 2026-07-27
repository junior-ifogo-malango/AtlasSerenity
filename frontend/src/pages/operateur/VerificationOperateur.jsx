import { useEffect, useRef, useState } from "react"
import { Navigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import Header from "../../components/layout/Header"
import { useAuth } from "../../context/AuthContext"
import apiFetch from "../../services/api"
import {
  TYPES_REQUIS,
  LABELS_DOCUMENT,
  STATUT_DOCUMENT_CLASSNAMES,
  STATUTS_DOCUMENT_LABEL_KEYS_OPERATEUR,
  STATUT_COMPTE_CLASSNAMES,
  STATUTS_COMPTE_LABEL_KEYS,
} from "../../constants/operateur"

function DocumentSlot({ type, document, onUpload }) {
  const { t } = useTranslation()
  const fileInputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)

  const statutInfo = document
    ? {
        label: t(STATUTS_DOCUMENT_LABEL_KEYS_OPERATEUR[document.statut]),
        className: STATUT_DOCUMENT_CLASSNAMES[document.statut],
      }
    : null

  async function handleSubmit(event) {
    event.preventDefault()
    const file = fileInputRef.current?.files?.[0]
    if (!file) return

    setError(null)
    setIsUploading(true)

    const formData = new FormData()
    formData.append("type_document", type)
    formData.append("document", file)

    try {
      await onUpload(formData)
      event.target.reset()
    } catch (err) {
      setError(
        err.data?.errors?.document?.[0] ??
          t("operateur.verification.uploadError")
      )
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="rounded-2xl border-2 border-cedre bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-fraunces text-lg font-semibold text-ink">{t(LABELS_DOCUMENT[type])}</h3>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${statutInfo?.className ?? "bg-ink/10 text-ink/60"}`}
        >
          {statutInfo?.label ?? t("operateur.documentStatus.notSent")}
        </span>
      </div>

      {document?.statut === "refuse" && document.commentaire_admin && (
        <p className="mt-3 rounded-lg border border-argile/20 bg-argile/5 p-3 text-base text-ink">
          <span className="font-medium">{t("operateur.verification.rejectReasonLabel")}</span>
          {document.commentaire_admin}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,application/pdf"
          className="block w-full text-base text-ink file:mr-4 file:rounded-full file:border-0 file:bg-cedre file:px-4 file:py-2 file:text-base file:font-medium file:text-cream hover:file:bg-cedre/90"
        />

        {error && (
          <p className="text-base text-argile" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isUploading}
          className="rounded-full border border-cedre px-6 py-2 text-base font-medium text-cedre transition-colors hover:bg-cedre hover:text-cream disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUploading
            ? t("operateur.verification.sending")
            : document
              ? t("operateur.verification.resendDocument")
              : t("operateur.verification.sendDocument")}
        </button>
      </form>
    </div>
  )
}

export default function VerificationOperateur() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [documents, setDocuments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user || user.role !== "operateur") return

    let cancelled = false

    async function fetchDocuments() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await apiFetch(`/documents-operateur?id_utilisateur=${user.id}`)
        if (!cancelled) {
          setDocuments(data ?? [])
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

    fetchDocuments()

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
          {t("operateur.verification.operatorOnly")}
        </p>
      </div>
    )
  }

  const typesRequis = TYPES_REQUIS[user.type_operateur] ?? []
  const statutCompteInfo = STATUTS_COMPTE_LABEL_KEYS[user.statut_compte]
    ? {
        label: t(STATUTS_COMPTE_LABEL_KEYS[user.statut_compte]),
        className: STATUT_COMPTE_CLASSNAMES[user.statut_compte],
      }
    : {
        label: user.statut_compte,
        className: "bg-ink/10 text-ink",
      }

  async function handleUpload(formData) {
    const document = await apiFetch("/documents-operateur", {
      method: "POST",
      body: formData,
    })
    setDocuments((current) => [
      ...current.filter((doc) => doc.type_document !== document.type_document),
      document,
    ])
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <h1 className="font-fraunces text-3xl font-semibold leading-snug text-ink">
            {t("nav.accountVerification")}
          </h1>
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${statutCompteInfo.className}`}>
            {statutCompteInfo.label}
          </span>
        </div>

        <p className="mb-8 text-base text-ink/70">
          {t("operateur.verification.intro")}
        </p>

        {error && (
          <p className="mb-6 text-argile" role="alert">
            {t("operateur.verification.loadError")}
          </p>
        )}

        {isLoading && !error && <p className="text-ink/70">{t("operateur.verification.loading")}</p>}

        {!isLoading && !error && (
          <div className="space-y-4">
            {typesRequis.map((type) => (
              <DocumentSlot
                key={type}
                type={type}
                document={documents.find((doc) => doc.type_document === type)}
                onUpload={handleUpload}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
