import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { X } from 'lucide-react'
import apiFetch from '../../services/api'

const OPTIONS_HEURE = [
  { valeur: 'matin', label: 'Matin (avant 12h)' },
  { valeur: 'apres_midi', label: 'Après-midi (12h-17h)' },
  { valeur: 'soiree', label: 'Soirée (après 17h)' },
]

const OPTIONS_DUREE_UNITE = [
  { valeur: '', label: 'Peu importe' },
  { valeur: 'minutes', label: 'Minutes' },
  { valeur: 'heures', label: 'Heures' },
  { valeur: 'jours', label: 'Jours' },
]

const OPTIONS_NOTE_MIN = [
  { valeur: '', label: 'Toutes notes' },
  { valeur: '3.0', label: '3.0+' },
  { valeur: '3.5', label: '3.5+' },
  { valeur: '4.0', label: '4.0+' },
]

const VILLES_VISIBLES_PAR_DEFAUT = 6

function valeursInitiales(searchParams) {
  return {
    heureDebut: searchParams.getAll('heure_debut'),
    dureeUnite: searchParams.get('duree_unite') ?? '',
    dureeMin: searchParams.get('duree_min') ?? '',
    dureeMax: searchParams.get('duree_max') ?? '',
    prixMin: searchParams.get('prix_min') ?? '',
    prixMax: searchParams.get('prix_max') ?? '',
    categories: searchParams.getAll('categories'),
    villes: searchParams.getAll('villes'),
    noteMin: searchParams.get('note_min') ?? '',
  }
}

function toggleValeur(liste, valeur) {
  return liste.includes(valeur) ? liste.filter((v) => v !== valeur) : [...liste, valeur]
}

export default function FiltresModal({ isOpen, onClose, categories }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [villesDisponibles, setVillesDisponibles] = useState([])
  const [heureDebut, setHeureDebut] = useState([])
  const [dureeUnite, setDureeUnite] = useState('')
  const [dureeMin, setDureeMin] = useState('')
  const [dureeMax, setDureeMax] = useState('')
  const [prixMin, setPrixMin] = useState('')
  const [prixMax, setPrixMax] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedVilles, setSelectedVilles] = useState([])
  const [noteMin, setNoteMin] = useState('')
  const [afficherToutesVilles, setAfficherToutesVilles] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    const valeurs = valeursInitiales(searchParams)
    setHeureDebut(valeurs.heureDebut)
    setDureeUnite(valeurs.dureeUnite)
    setDureeMin(valeurs.dureeMin)
    setDureeMax(valeurs.dureeMax)
    setPrixMin(valeurs.prixMin)
    setPrixMax(valeurs.prixMax)
    setSelectedCategories(valeurs.categories)
    setSelectedVilles(valeurs.villes)
    setNoteMin(valeurs.noteMin)
    setAfficherToutesVilles(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || villesDisponibles.length > 0) return

    let cancelled = false

    apiFetch('/villes')
      .then((data) => {
        if (!cancelled) {
          setVillesDisponibles(data ?? [])
        }
      })
      .catch(() => {
        if (!cancelled) {
          setVillesDisponibles([])
        }
      })

    return () => {
      cancelled = true
    }
  }, [isOpen, villesDisponibles.length])

  if (!isOpen) return null

  function handleReinitialiser() {
    setHeureDebut([])
    setDureeUnite('')
    setDureeMin('')
    setDureeMax('')
    setPrixMin('')
    setPrixMax('')
    setSelectedCategories([])
    setSelectedVilles([])
    setNoteMin('')
    setAfficherToutesVilles(false)
  }

  function handleAppliquer(event) {
    event.preventDefault()

    const params = new URLSearchParams(searchParams)
    ;['heure_debut', 'duree_unite', 'duree_min', 'duree_max', 'prix_min', 'prix_max', 'categories', 'villes', 'note_min'].forEach(
      (cle) => params.delete(cle)
    )

    heureDebut.forEach((valeur) => params.append('heure_debut', valeur))
    selectedCategories.forEach((id) => params.append('categories', id))
    selectedVilles.forEach((nom) => params.append('villes', nom))
    if (dureeUnite) params.set('duree_unite', dureeUnite)
    if (dureeMin) params.set('duree_min', dureeMin)
    if (dureeMax) params.set('duree_max', dureeMax)
    if (prixMin) params.set('prix_min', prixMin)
    if (prixMax) params.set('prix_max', prixMax)
    if (noteMin) params.set('note_min', noteMin)

    navigate(`/recherche?${params.toString()}`)
    onClose()
  }

  const villesAffichees = afficherToutesVilles
    ? villesDisponibles
    : villesDisponibles.slice(0, VILLES_VISIBLES_PAR_DEFAUT)

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-ink/10 px-6 py-4">
          <h2 className="font-fraunces text-xl font-semibold text-ink">Filtres avancés</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-full p-1 text-ink/60 hover:bg-cream hover:text-ink"
          >
            <X className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleAppliquer} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-4">
            <fieldset>
              <legend className="mb-2 text-base font-semibold text-ink">Heure de début</legend>
              <div className="flex flex-col gap-2">
                {OPTIONS_HEURE.map((option) => (
                  <label key={option.valeur} className="flex items-center gap-2 text-base text-ink">
                    <input
                      type="checkbox"
                      checked={heureDebut.includes(option.valeur)}
                      onChange={() =>
                        setHeureDebut((current) => toggleValeur(current, option.valeur))
                      }
                      className="h-4 w-4 rounded border-ink/30 text-cedre focus:ring-cedre"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-base font-semibold text-ink">Durée</legend>
              <div className="mb-3 flex flex-wrap gap-3">
                {OPTIONS_DUREE_UNITE.map((option) => (
                  <label
                    key={option.valeur || 'peu-importe'}
                    className="flex items-center gap-2 text-base text-ink"
                  >
                    <input
                      type="radio"
                      name="duree_unite"
                      checked={dureeUnite === option.valeur}
                      onChange={() => setDureeUnite(option.valeur)}
                      className="h-4 w-4 border-ink/30 text-cedre focus:ring-cedre"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <label className="flex min-w-0 flex-1 flex-col gap-1 text-base text-ink/70">
                  Valeur min
                  <input
                    type="number"
                    min="0"
                    value={dureeMin}
                    onChange={(event) => setDureeMin(event.target.value)}
                    className="w-full min-w-0 rounded-lg border border-ink/15 px-3 py-2 text-base text-ink focus:outline-none focus:ring-1 focus:ring-cedre"
                  />
                </label>
                <label className="flex min-w-0 flex-1 flex-col gap-1 text-base text-ink/70">
                  Valeur max
                  <input
                    type="number"
                    min="0"
                    value={dureeMax}
                    onChange={(event) => setDureeMax(event.target.value)}
                    className="w-full min-w-0 rounded-lg border border-ink/15 px-3 py-2 text-base text-ink focus:outline-none focus:ring-1 focus:ring-cedre"
                  />
                </label>
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-base font-semibold text-ink">Prix (MAD)</legend>
              <div className="flex items-center gap-3">
                <label className="flex min-w-0 flex-1 flex-col gap-1 text-base text-ink/70">
                  Prix min
                  <input
                    type="number"
                    min="0"
                    value={prixMin}
                    onChange={(event) => setPrixMin(event.target.value)}
                    className="w-full min-w-0 rounded-lg border border-ink/15 px-3 py-2 text-base text-ink focus:outline-none focus:ring-1 focus:ring-cedre"
                  />
                </label>
                <label className="flex min-w-0 flex-1 flex-col gap-1 text-base text-ink/70">
                  Prix max
                  <input
                    type="number"
                    min="0"
                    value={prixMax}
                    onChange={(event) => setPrixMax(event.target.value)}
                    className="w-full min-w-0 rounded-lg border border-ink/15 px-3 py-2 text-base text-ink focus:outline-none focus:ring-1 focus:ring-cedre"
                  />
                </label>
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-base font-semibold text-ink">Catégories</legend>
              <div className="flex flex-col gap-2">
                {categories.map((categorie) => (
                  <label key={categorie.id} className="flex items-center gap-2 text-base text-ink">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(String(categorie.id))}
                      onChange={() =>
                        setSelectedCategories((current) =>
                          toggleValeur(current, String(categorie.id))
                        )
                      }
                      className="h-4 w-4 rounded border-ink/30 text-cedre focus:ring-cedre"
                    />
                    {categorie.nom}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-base font-semibold text-ink">Villes</legend>
              <div className="flex flex-col gap-2">
                {villesAffichees.map((ville) => (
                  <label key={ville.id} className="flex items-center gap-2 text-base text-ink">
                    <input
                      type="checkbox"
                      checked={selectedVilles.includes(ville.nom)}
                      onChange={() =>
                        setSelectedVilles((current) => toggleValeur(current, ville.nom))
                      }
                      className="h-4 w-4 rounded border-ink/30 text-cedre focus:ring-cedre"
                    />
                    {ville.nom}
                    {ville.region && <span className="text-ink/50"> · {ville.region}</span>}
                  </label>
                ))}
              </div>

              {villesDisponibles.length > VILLES_VISIBLES_PAR_DEFAUT && (
                <button
                  type="button"
                  onClick={() => setAfficherToutesVilles((current) => !current)}
                  className="mt-2 text-sm font-medium text-cedre hover:underline"
                >
                  {afficherToutesVilles ? 'Afficher moins' : 'Afficher plus'}
                </button>
              )}
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-base font-semibold text-ink">Note minimum</legend>
              <div className="flex flex-wrap gap-3">
                {OPTIONS_NOTE_MIN.map((option) => (
                  <label
                    key={option.valeur || 'toutes-notes'}
                    className="flex items-center gap-2 text-base text-ink"
                  >
                    <input
                      type="radio"
                      name="note_min"
                      checked={noteMin === option.valeur}
                      onChange={() => setNoteMin(option.valeur)}
                      className="h-4 w-4 border-ink/30 text-cedre focus:ring-cedre"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="flex shrink-0 justify-end gap-3 border-t border-ink/10 px-6 py-4">
            <button
              type="button"
              onClick={handleReinitialiser}
              className="rounded-full px-4 py-2 text-base font-medium text-ink/70 transition-colors hover:bg-cream"
            >
              Réinitialiser
            </button>
            <button
              type="submit"
              className="rounded-full bg-cedre px-6 py-2 text-base font-medium text-cream shadow-sm transition-colors hover:bg-cedre/90"
            >
              Appliquer
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
