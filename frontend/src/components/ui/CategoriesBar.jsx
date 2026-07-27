import { useEffect, useState } from "react"
import {
  Binoculars,
  Bike,
  Compass,
  Home,
  Landmark,
  LayoutGrid,
  Leaf,
  MapPin,
  Mountain,
  MountainSnow,
  Palette,
  PawPrint,
  Sparkles,
  Sun,
  Tent,
  UtensilsCrossed,
  Waves,
  Wheat,
} from "lucide-react"
import apiFetch from "../../services/api"

const ICONES_PAR_MOT_CLE = [
  [/observation|oiseau|ornitho/, Binoculars],
  [/rando|trek/, Mountain],
  [/lodge/, Home],
  [/agritourisme|agro/, Wheat],
  [/artisanat/, Palette],
  [/désert|desert/, Sun],
  [/montagne/, MountainSnow],
  [/plage|mer|côt/, Waves],
  [/cultur|patrimoine|médina|kasbah/, Landmark],
  [/gastro|cuisine|culinaire/, UtensilsCrossed],
  [/nature|faune|flore/, Leaf],
  [/aventure|escalade/, Compass],
  [/bien-être|bien être|spa|détente/, Sparkles],
  [/vélo|cyclisme|vtt/, Bike],
  [/cheval|équitation/, PawPrint],
  [/camping|bivouac/, Tent],
]

function getIconeCategorie(nom) {
  const match = ICONES_PAR_MOT_CLE.find(([regex]) => regex.test(nom.toLowerCase()))
  return match ? match[1] : MapPin
}

function Pastille({ isSelected, onClick, ariaLabel, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={isSelected}
      title={ariaLabel}
      className={`flex shrink-0 items-center gap-3 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
        isSelected
          ? "border-cedre bg-cedre text-cream"
          : "border-ink/15 text-ink hover:border-cedre/50"
      }`}
    >
      {children}
    </button>
  )
}

export default function CategoriesBar({ selectedId, onSelect, prefix, categories: categoriesFournies }) {
  const [categoriesChargees, setCategoriesChargees] = useState([])
  const [isLoading, setIsLoading] = useState(categoriesFournies === undefined)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (categoriesFournies !== undefined) return

    let cancelled = false

    async function fetchCategories() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await apiFetch("/categories")
        if (!cancelled) {
          setCategoriesChargees(data ?? [])
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

    fetchCategories()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const categories = categoriesFournies ?? categoriesChargees

  if (isLoading || error || categories.length === 0) {
    return null
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-3">
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {prefix}

        <Pastille
          isSelected={selectedId === null}
          onClick={() => onSelect(null)}
          ariaLabel="Toutes les catégories"
        >
          <LayoutGrid className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
        </Pastille>

        {categories.map((categorie) => {
          const Icone = getIconeCategorie(categorie.nom)
          return (
            <Pastille
              key={categorie.id}
              isSelected={selectedId === categorie.id}
              onClick={() => onSelect(categorie.id)}
            >
              <Icone className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              {categorie.nom}
            </Pastille>
          )
        })}
      </div>
    </div>
  )
}
