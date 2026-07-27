import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react"
import Header from "../../components/layout/Header"
import { useAuth } from "../../context/AuthContext"
import apiFetch, { API_BASE_URL } from "../../services/api"
import useAutoGrowTextarea from "../../hooks/useAutoGrowTextarea"

const STORAGE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "")

function photoUrl(chemin) {
  return `${STORAGE_BASE_URL}/storage/${chemin}`
}

function formatPrixMAD(prix) {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0,
  }).format(prix)
}

function formatDuree(valeur, unite) {
  const nombre = Number(valeur)
  return `${nombre % 1 === 0 ? nombre : nombre.toFixed(1)} ${unite}`
}

function formatDateDispo(dateDispo) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "long",
  }).format(new Date(`${dateDispo}T00:00:00`))
}

function formatHeureDispo(heureDispo) {
  return heureDispo.slice(0, 5)
}

function Disponibilites({
  disponibilites,
  selectedDisponibilite,
  onSelect,
  nombrePersonnes,
  onChangeNombrePersonnes,
}) {
  if (disponibilites.length === 0) {
    return <p className="text-base text-ink/70">Aucun créneau disponible pour le moment.</p>
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {disponibilites.map((dispo) => {
          const complet = dispo.places_restantes <= 0
          const isSelected = selectedDisponibilite?.id === dispo.id

          return (
            <button
              key={dispo.id}
              type="button"
              disabled={complet}
              onClick={() => onSelect(dispo)}
              className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                complet
                  ? "cursor-not-allowed border-ink/10 bg-ink/5 text-ink/40"
                  : isSelected
                    ? "border-cedre bg-cedre/5 text-ink"
                    : "border-ink/15 text-ink hover:border-cedre/50"
              }`}
            >
              <div className="font-medium capitalize">{formatDateDispo(dispo.date_dispo)}</div>
              <div className="text-base text-ink/70">{formatHeureDispo(dispo.heure_dispo)}</div>
              <div className="mt-1 text-base font-medium">
                {complet ? "Complet" : `${dispo.places_restantes} place${dispo.places_restantes > 1 ? "s" : ""} restante${dispo.places_restantes > 1 ? "s" : ""}`}
              </div>
            </button>
          )
        })}
      </div>

      {selectedDisponibilite && (
        <div>
          <label htmlFor="nombre-personnes" className="block text-base font-medium text-ink mb-1">
            Nombre de personnes
          </label>
          <select
            id="nombre-personnes"
            value={nombrePersonnes}
            onChange={(e) => onChangeNombrePersonnes(Number(e.target.value))}
            className="w-full max-w-[10rem] rounded-lg border border-ink/15 bg-white px-4 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-cedre"
          >
            {Array.from({ length: selectedDisponibilite.places_restantes }, (_, i) => i + 1).map(
              (n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              )
            )}
          </select>
        </div>
      )}
    </div>
  )
}

function BlocReservation({
  reservation,
  reservationError,
  prixMad,
  selectedDisponibilite,
  isReserving,
  onReserver,
}) {
  if (reservation) {
    return (
      <div className="rounded-lg border border-cedre/30 bg-cedre/5 p-4">
        <p className="font-medium text-ink">Réservation confirmée !</p>
        <p className="mt-1 text-sm text-ink/70">
          Numéro de réservation :{" "}
          <span className="font-medium text-ink">{reservation.numero_reservation}</span>
        </p>
        <Link
          to="/mes-reservations"
          className="mt-3 inline-block text-base font-medium text-cedre hover:underline"
        >
          Voir mes réservations →
        </Link>
      </div>
    )
  }

  return (
    <>
      {reservationError && (
        <p className="mb-3 text-base text-price" role="alert">
          {reservationError}
        </p>
      )}

      <div className="flex items-center justify-between gap-4">
        <span className="text-2xl font-semibold text-price">{formatPrixMAD(prixMad)}</span>

        <button
          type="button"
          disabled={!selectedDisponibilite || isReserving}
          onClick={onReserver}
          className="rounded-full bg-cedre px-8 py-3 text-base font-medium text-cream shadow-md transition-colors hover:bg-cedre/90 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-cedre"
        >
          {isReserving ? "Réservation..." : "Réserver"}
        </button>
      </div>
    </>
  )
}

function BadgeEcoOverlay() {
  return (
    <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-cedre px-4 py-2 text-sm font-medium text-cream shadow-lg">
      <svg
        className="h-4 w-4 shrink-0"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 2C7 2 3 6 3 11c0 5.5 4.5 9.5 8.3 10.9.4.15.9.15 1.3 0C16.5 20.5 21 16.5 21 11c0-5-4-9-9-9zm-.9 14.6l-3.2-3.2 1.06-1.06 2.14 2.14 4.7-4.7 1.06 1.06-5.76 5.76z" />
      </svg>
      Certifié éco-responsable
    </div>
  )
}

// Sur 3 photos annexes, la 1re occupe toute la hauteur de la colonne de gauche
// (row-span-2) et les 2 suivantes se partagent la colonne de droite : ça remplit
// les 4 cases du grid 2x2 sans en laisser une vide.
function sideGridClasses(count) {
  if (count === 1) return "grid-cols-1 grid-rows-1"
  if (count === 2) return "grid-cols-1 grid-rows-2"
  return "grid-cols-2 grid-rows-2"
}

function sideCellClasses(count, index) {
  return count === 3 && index === 0 ? "row-span-2" : ""
}

function VoirToutOverlay({ total }) {
  return (
    <span className="absolute inset-0 flex items-center justify-center gap-1.5 bg-ink/55 text-sm font-medium text-cream transition-colors hover:bg-ink/65">
      <Images className="h-4 w-4" aria-hidden="true" />
      Voir tout ({total})
    </span>
  )
}

function Lightbox({ photos, titre, currentIndex, onIndexChange, onClose }) {
  const containerRef = useRef(null)
  const imgRef = useRef(null)
  const [compteurPosition, setCompteurPosition] = useState({ top: 0, left: 0 })

  // Ancre le compteur au bord supérieur réel de l'image affichée (mesuré via
  // getBoundingClientRect, relatif au conteneur de la lightbox, pas au
  // viewport) plutôt qu'à un point fixe : la taille rendue de l'image varie
  // selon son ratio (object-contain) et change à chaque navigation.
  function updateCompteurPosition() {
    if (!containerRef.current || !imgRef.current) return
    const containerRect = containerRef.current.getBoundingClientRect()
    const imgRect = imgRef.current.getBoundingClientRect()
    setCompteurPosition({
      top: imgRect.top - containerRect.top + 12,
      left: imgRect.left - containerRect.left + imgRect.width / 2,
    })
  }

  useLayoutEffect(() => {
    updateCompteurPosition()
  }, [currentIndex])

  useEffect(() => {
    window.addEventListener("resize", updateCompteurPosition)
    return () => window.removeEventListener("resize", updateCompteurPosition)
  }, [])

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose()
      else if (event.key === "ArrowLeft") onIndexChange((i) => (i - 1 + photos.length) % photos.length)
      else if (event.key === "ArrowRight") onIndexChange((i) => (i + 1) % photos.length)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [photos.length, onClose, onIndexChange])

  const photo = photos[currentIndex]

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col bg-ink/95" onClick={onClose}>
      <div className="flex shrink-0 items-center justify-end px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="rounded-full p-2 text-cream hover:bg-cream/10"
        >
          <X className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      <div
        ref={containerRef}
        className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4 sm:px-16"
        onClick={(event) => event.stopPropagation()}
      >
        {photos.length > 1 && (
          <button
            type="button"
            onClick={() => onIndexChange((i) => (i - 1 + photos.length) % photos.length)}
            aria-label="Photo précédente"
            className="absolute left-2 rounded-full p-2 text-cream hover:bg-cream/10 sm:left-4"
          >
            <ChevronLeft className="h-7 w-7" aria-hidden="true" />
          </button>
        )}

        <span
          className="absolute z-10 -translate-x-1/2 rounded-full bg-ink/55 px-3 py-1.5 text-sm font-medium text-cream"
          style={{ top: compteurPosition.top, left: compteurPosition.left }}
        >
          {currentIndex + 1} / {photos.length}
        </span>

        <img
          ref={imgRef}
          src={photoUrl(photo.chemin)}
          alt={titre}
          onLoad={updateCompteurPosition}
          className="max-h-full max-w-full rounded-lg object-contain"
        />

        {photos.length > 1 && (
          <button
            type="button"
            onClick={() => onIndexChange((i) => (i + 1) % photos.length)}
            aria-label="Photo suivante"
            className="absolute right-2 rounded-full p-2 text-cream hover:bg-cream/10 sm:right-4"
          >
            <ChevronRight className="h-7 w-7" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>,
    document.body
  )
}

function Galerie({ photos, titre, badgeEco }) {
  // Réutilisé à la fois comme index actif du carrousel mobile et comme photo
  // ouverte dans la lightbox (desktop et mobile).
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const carouselRef = useRef(null)

  if (!photos || photos.length === 0) {
    return (
      <div className="relative h-72 w-full rounded-2xl bg-gradient-to-br from-price via-orange-400 to-ink sm:h-96">
        {Boolean(badgeEco) && <BadgeEcoOverlay />}
      </div>
    )
  }

  function openLightbox(index) {
    setSelectedIndex(index)
    setLightboxOpen(true)
  }

  function handleCarouselScroll(event) {
    const el = event.currentTarget
    if (el.clientWidth === 0) return
    const index = Math.min(Math.round(el.scrollLeft / el.clientWidth), photos.length - 1)
    setSelectedIndex(index)
  }

  function scrollCarouselTo(index) {
    carouselRef.current?.scrollTo({ left: index * carouselRef.current.clientWidth, behavior: "smooth" })
    setSelectedIndex(index)
  }

  const mainPhoto = photos[0]
  const sidePhotos = photos.slice(1, 5)

  return (
    <div>
      {/* Desktop : grande image (60%) + grille 2x2 des photos suivantes (40%) */}
      <div className="relative hidden overflow-hidden rounded-2xl lg:block">
        <div className="flex gap-2 lg:h-[420px]">
          <button
            type="button"
            onClick={() => openLightbox(0)}
            className="relative h-full flex-[3] overflow-hidden"
          >
            <img src={photoUrl(mainPhoto.chemin)} alt={titre} className="h-full w-full object-cover" />
          </button>

          {sidePhotos.length > 0 && (
            <div className={`grid h-full flex-[2] gap-2 ${sideGridClasses(sidePhotos.length)}`}>
              {sidePhotos.map((photo, index) => {
                const isLast = index === sidePhotos.length - 1
                return (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => openLightbox(index + 1)}
                    className={`relative overflow-hidden ${sideCellClasses(sidePhotos.length, index)}`}
                  >
                    <img
                      src={photoUrl(photo.chemin)}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                    {isLast && <VoirToutOverlay total={photos.length} />}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {Boolean(badgeEco) && <BadgeEcoOverlay />}
      </div>

      {/* Mobile/tablette : carrousel horizontal swipable, à une photo à la fois */}
      <div className="lg:hidden">
        <div className="relative overflow-hidden rounded-2xl">
          <div
            ref={carouselRef}
            onScroll={handleCarouselScroll}
            className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => openLightbox(index)}
                className="h-72 w-full shrink-0 snap-center sm:h-96"
              >
                <img
                  src={photoUrl(photo.chemin)}
                  alt={index === 0 ? titre : ""}
                  loading={index === 0 ? "eager" : "lazy"}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>

          {Boolean(badgeEco) && <BadgeEcoOverlay />}
        </div>

        {photos.length > 1 && (
          <div className="mt-3 flex justify-center gap-1.5">
            {photos.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => scrollCarouselTo(index)}
                aria-label={`Aller à la photo ${index + 1}`}
                className={`h-2 rounded-full transition-all ${
                  index === selectedIndex ? "w-5 bg-cedre" : "w-2 bg-ink/20"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <Lightbox
          photos={photos}
          titre={titre}
          currentIndex={selectedIndex}
          onIndexChange={setSelectedIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  )
}

const ETOILE_PATH =
  "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.448a1 1 0 00-.364 1.118l1.286 3.957c.3.922-.755 1.688-1.539 1.118l-3.367-2.447a1 1 0 00-1.175 0l-3.367 2.447c-.784.57-1.838-.196-1.539-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.063 9.385c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.285-3.958z"

function formatDateAvis(date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date))
}

function Etoiles({ note }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${note} sur 5 étoiles`}>
      {[1, 2, 3, 4, 5].map((valeur) => (
        <svg
          key={valeur}
          className={`h-4 w-4 ${valeur <= note ? "text-amber-500" : "text-ink/15"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d={ETOILE_PATH} />
        </svg>
      ))}
    </div>
  )
}

function EtoilesInput({ value, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((valeur) => (
        <button
          key={valeur}
          type="button"
          onClick={() => onChange(valeur)}
          className="p-0.5"
          aria-label={`${valeur} étoile${valeur > 1 ? "s" : ""}`}
        >
          <svg
            className={`h-7 w-7 transition-colors ${
              valeur <= value ? "text-amber-500" : "text-ink/15 hover:text-amber-300"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d={ETOILE_PATH} />
          </svg>
        </button>
      ))}
    </div>
  )
}

function AvisCard({ avis }) {
  return (
    <div className="rounded-lg border border-ink/10 p-4">
      <div className="flex items-center justify-between gap-3">
        <Etoiles note={avis.note} />
        <span className="text-sm text-ink/50">{formatDateAvis(avis.created_at)}</span>
      </div>

      {avis.commentaire && (
        <p className="mt-2 text-base text-ink/80 leading-relaxed">{avis.commentaire}</p>
      )}

      {avis.reponse_operateur && (
        <div className="mt-3 rounded-lg bg-ink/5 p-3">
          <p className="text-base font-medium text-ink">Réponse de l'opérateur</p>
          <p className="mt-1 text-base text-ink/70">{avis.reponse_operateur}</p>
        </div>
      )}
    </div>
  )
}

function AvisForm({
  note,
  onChangeNote,
  commentaire,
  onChangeCommentaire,
  onSubmit,
  isSubmitting,
  error,
}) {
  const commentaireRef = useAutoGrowTextarea(commentaire)

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-lg border-2 border-cedre p-4">
      <p className="text-base font-medium text-ink">Laisser un avis</p>

      <EtoilesInput value={note} onChange={onChangeNote} />

      <textarea
        ref={commentaireRef}
        value={commentaire}
        onChange={(e) => onChangeCommentaire(e.target.value)}
        placeholder="Votre commentaire (facultatif)"
        rows={3}
        className="w-full resize-none overflow-y-auto rounded-lg border border-ink/15 bg-white px-4 py-2 text-base text-ink focus:outline-none focus:ring-2 focus:ring-cedre"
      />

      {error && (
        <p className="text-base text-price" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-cedre px-6 py-2 text-base font-medium text-cream shadow-md transition-colors hover:bg-cedre/90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isSubmitting ? "Envoi..." : "Publier mon avis"}
      </button>
    </form>
  )
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse px-6 py-12">
      <div className="h-72 w-full rounded-2xl bg-ink/10 sm:h-96" />
      <div className="mt-6 h-8 w-2/3 rounded bg-ink/10" />
      <div className="mt-3 h-5 w-1/3 rounded bg-ink/10" />
      <div className="mt-6 h-24 w-full rounded bg-ink/10" />
    </div>
  )
}

export default function DetailActivite() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activite, setActivite] = useState(null)
  const [photos, setPhotos] = useState([])
  const [disponibilites, setDisponibilites] = useState([])
  const [selectedDisponibilite, setSelectedDisponibilite] = useState(null)
  const [nombrePersonnes, setNombrePersonnes] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isReserving, setIsReserving] = useState(false)
  const [reservationError, setReservationError] = useState(null)
  const [reservation, setReservation] = useState(null)
  const [avis, setAvis] = useState([])
  const [mesReservationsActivite, setMesReservationsActivite] = useState([])
  const [avisNote, setAvisNote] = useState(0)
  const [avisCommentaire, setAvisCommentaire] = useState("")
  const [isSubmittingAvis, setIsSubmittingAvis] = useState(false)
  const [avisFormError, setAvisFormError] = useState(null)

  function handleSelectDisponibilite(dispo) {
    setSelectedDisponibilite(dispo)
    setNombrePersonnes(1)
    setReservationError(null)
  }

  async function handleReserver() {
    if (!user) {
      navigate(`/register?redirect=${encodeURIComponent(`/activites/${id}`)}`)
      return
    }

    if (!selectedDisponibilite) return

    setIsReserving(true)
    setReservationError(null)

    try {
      const data = await apiFetch("/reservations", {
        method: "POST",
        body: JSON.stringify({
          id_voyageur: user.id,
          id_activite: id,
          id_disponibilite: selectedDisponibilite.id,
          nombre_personnes: nombrePersonnes,
        }),
      })
      setReservation(data)
    } catch (err) {
      setReservationError(
        err.status === 409
          ? "Il ne reste plus assez de places disponibles pour ce créneau. Choisissez un autre créneau ou réduisez le nombre de personnes."
          : "Une erreur est survenue lors de la réservation. Veuillez réessayer."
      )
    } finally {
      setIsReserving(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    async function fetchDetail() {
      setIsLoading(true)
      setError(null)
      try {
        const [activiteData, photosData, disponibilitesData, avisData] = await Promise.all([
          apiFetch(`/activites/${id}`),
          apiFetch(`/photos-activite?id_activite=${id}`),
          apiFetch(`/disponibilites?id_activite=${id}`),
          apiFetch(`/avis?id_activite=${id}`),
        ])
        if (!cancelled) {
          setActivite(activiteData)
          setPhotos(photosData ?? [])
          setDisponibilites(disponibilitesData ?? [])
          setAvis(avisData ?? [])
          setSelectedDisponibilite(null)
          setNombrePersonnes(1)
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

    fetchDetail()

    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    if (!user) {
      setMesReservationsActivite([])
      return
    }

    let cancelled = false

    apiFetch(`/reservations?id_voyageur=${user.id}&id_activite=${id}`)
      .then((data) => {
        if (!cancelled) {
          setMesReservationsActivite(data ?? [])
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMesReservationsActivite([])
        }
      })

    return () => {
      cancelled = true
    }
  }, [id, user])

  const idsReservationsAvisees = new Set(avis.map((item) => item.id_reservation))
  const reservationSansAvis = mesReservationsActivite.find(
    (r) => r.statut !== "annulee" && !idsReservationsAvisees.has(r.id)
  )
  const peutLaisserUnAvis = Boolean(user) && Boolean(reservationSansAvis)

  async function handleSubmitAvis(e) {
    e.preventDefault()

    if (avisNote < 1) {
      setAvisFormError("Veuillez sélectionner une note.")
      return
    }

    setIsSubmittingAvis(true)
    setAvisFormError(null)

    try {
      const data = await apiFetch("/avis", {
        method: "POST",
        body: JSON.stringify({
          id_reservation: reservationSansAvis.id,
          note: avisNote,
          commentaire: avisCommentaire.trim() || null,
        }),
      })
      setAvis((prev) => [data, ...prev])
      setAvisNote(0)
      setAvisCommentaire("")
    } catch {
      setAvisFormError("Une erreur est survenue lors de l'envoi de votre avis. Veuillez réessayer.")
    } finally {
      setIsSubmittingAvis(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      {isLoading && <DetailSkeleton />}

      {!isLoading && error && (
        <p className="mx-auto max-w-4xl px-6 py-12 text-price">
          Impossible de charger cette activité pour le moment. Veuillez réessayer plus tard.
        </p>
      )}

      {!isLoading && !error && activite && (
        <div className="mx-auto max-w-6xl px-6 py-12">
          <Galerie photos={photos} titre={activite.titre} badgeEco={activite.badge_eco} />

          <div className="mt-8 lg:flex lg:items-start lg:gap-10">
            <div className="space-y-6 lg:flex-1">
              <div>
                <h1 className="font-fraunces text-3xl font-semibold leading-snug text-ink sm:text-4xl">
                  {activite.titre}
                </h1>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-base text-ink/70">
                  <span>{activite.region}</span>
                  <span aria-hidden="true">•</span>
                  <span>{formatDuree(activite.duree_valeur, activite.duree_unite)}</span>
                </div>
              </div>

              {activite.description && (
                <p className="whitespace-pre-line text-base text-ink leading-relaxed">
                  {activite.description}
                </p>
              )}

              {activite.langues && activite.langues.length > 0 && (
                <div>
                  <h2 className="text-base font-medium text-ink mb-1">Langues parlées</h2>
                  <p className="text-base text-ink/70">
                    {activite.langues.map((langue) => langue.nom).join(", ")}
                  </p>
                </div>
              )}

              <div>
                <h2 className="text-base font-medium text-ink mb-2">Créneaux disponibles</h2>
                <Disponibilites
                  disponibilites={disponibilites}
                  selectedDisponibilite={selectedDisponibilite}
                  onSelect={handleSelectDisponibilite}
                  nombrePersonnes={nombrePersonnes}
                  onChangeNombrePersonnes={setNombrePersonnes}
                />
              </div>

              <div className="border-t border-ink/10 pt-6 lg:hidden">
                <BlocReservation
                  reservation={reservation}
                  reservationError={reservationError}
                  prixMad={activite.prix_mad}
                  selectedDisponibilite={selectedDisponibilite}
                  isReserving={isReserving}
                  onReserver={handleReserver}
                />
              </div>

              <div className="border-t border-ink/10 pt-6">
                <h2 className="text-base font-medium text-ink mb-3">Avis</h2>

                {avis.length === 0 ? (
                  <p className="text-base text-ink/70">Aucun avis pour le moment.</p>
                ) : (
                  <div className="space-y-3">
                    {avis.map((item) => (
                      <AvisCard key={item.id} avis={item} />
                    ))}
                  </div>
                )}

                {peutLaisserUnAvis && (
                  <div className="mt-4">
                    <AvisForm
                      note={avisNote}
                      onChangeNote={setAvisNote}
                      commentaire={avisCommentaire}
                      onChangeCommentaire={setAvisCommentaire}
                      onSubmit={handleSubmitAvis}
                      isSubmitting={isSubmittingAvis}
                      error={avisFormError}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="hidden lg:block lg:w-96 lg:shrink-0">
              <div className="lg:sticky lg:top-24 rounded-2xl border border-ink/15 bg-white p-6 shadow-sm">
                <BlocReservation
                  reservation={reservation}
                  reservationError={reservationError}
                  prixMad={activite.prix_mad}
                  selectedDisponibilite={selectedDisponibilite}
                  isReserving={isReserving}
                  onReserver={handleReserver}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
