import { useEffect, useRef, useState } from "react"
import { Navigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import Header from "../../components/layout/Header"
import { useAuth } from "../../context/AuthContext"
import apiFetch, { API_BASE_URL } from "../../services/api"

const STORAGE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "")

export default function GererPhotos() {
  const { t } = useTranslation()
  const { id } = useParams()
  const { user } = useAuth()
  const fileInputRef = useRef(null)

  const [activite, setActivite] = useState(null)
  const [photos, setPhotos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const [deletingId, setDeletingId] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)

  useEffect(() => {
    if (!user || user.role !== "operateur") return

    let cancelled = false

    async function fetchData() {
      setIsLoading(true)
      setError(null)
      try {
        const [activiteData, photosData] = await Promise.all([
          apiFetch(`/activites/${id}`),
          apiFetch(`/photos-activite?id_activite=${id}`),
        ])
        if (!cancelled) {
          setActivite(activiteData)
          setPhotos(photosData ?? [])
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
          {t("operateur.verification.operatorOnly")}
        </p>
      </div>
    )
  }

  async function handleDelete(photoId) {
    setDeletingId(photoId)
    try {
      await apiFetch(`/photos-activite/${photoId}`, { method: "DELETE" })
      setPhotos((current) => current.filter((photo) => photo.id !== photoId))
    } catch {
      setUploadError(t("operateur.photos.deleteError"))
    } finally {
      setDeletingId(null)
    }
  }

  async function handleUpload(event) {
    event.preventDefault()
    const files = fileInputRef.current?.files
    if (!files || files.length === 0) return

    setUploadError(null)
    setIsUploading(true)

    const formData = new FormData()
    formData.append("id_activite", id)
    Array.from(files).forEach((file) => formData.append("photos[]", file))

    try {
      const nouvellesPhotos = await apiFetch("/photos-activite", {
        method: "POST",
        body: formData,
      })
      setPhotos((current) => [...current, ...(nouvellesPhotos ?? [])])
      event.target.reset()
    } catch (err) {
      // Les erreurs par fichier ("photos.*") sont indexées par Laravel sous
      // des clés "photos.0", "photos.1", ... et non "photos" : on cherche la
      // première clé d'erreur commençant par "photos" plutôt que la clé exacte.
      const erreurs = err.data?.errors
      const clePhoto = erreurs && Object.keys(erreurs).find((cle) => cle.startsWith("photos"))

      setUploadError(
        (clePhoto && erreurs[clePhoto]?.[0]) ??
          t("operateur.photos.uploadError")
      )
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="font-fraunces text-3xl font-semibold leading-snug text-ink mb-1">
          {t("operateur.photos.title")}
        </h1>
        {activite && <p className="text-ink/70 mb-8">{activite.titre}</p>}

        {error && (
          <p className="text-price">
            {t("operateur.photos.loadError")}
          </p>
        )}

        {!error && isLoading && <p className="text-ink/70">{t("common.loading")}</p>}

        {!error && !isLoading && (
          <>
            <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {photos.length === 0 && (
                <p className="col-span-full text-ink/70">{t("operateur.photos.empty")}</p>
              )}

              {photos.map((photo) => (
                <div key={photo.id} className="group relative overflow-hidden rounded-lg">
                  <img
                    src={`${STORAGE_BASE_URL}/storage/${photo.chemin}`}
                    alt=""
                    className="h-32 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleDelete(photo.id)}
                    disabled={deletingId === photo.id}
                    className="absolute right-1 top-1 rounded-full bg-ink/70 px-2 py-1 text-sm font-medium text-cream shadow-sm transition-colors hover:bg-price disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingId === photo.id ? "..." : t("activityCard.delete")}
                  </button>
                </div>
              ))}
            </div>

            <h2 className="text-lg font-semibold text-ink mb-3">{t("operateur.photos.addPhotosTitle")}</h2>
            <p className="mb-3 text-base text-ink/60">
              {t("operateur.photos.requirements")}
            </p>

            <form
              onSubmit={handleUpload}
              className="space-y-4 rounded-2xl border-2 border-cedre bg-white p-6 shadow-sm"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/bmp"
                multiple
                className="block w-full text-base text-ink file:mr-4 file:rounded-full file:border-0 file:bg-cedre file:px-4 file:py-2 file:text-base file:font-medium file:text-cream hover:file:bg-cedre/90"
              />

              {uploadError && (
                <p className="text-base text-price" role="alert">
                  {uploadError}
                </p>
              )}

              <button
                type="submit"
                disabled={isUploading}
                className="rounded-full bg-cedre px-8 py-3 text-base font-medium text-cream shadow-md transition-colors hover:bg-cedre/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploading ? t("common.sending") : t("operateur.photos.submit")}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
