import { useEffect, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import apiFetch from '../../services/api'
import CategoriesBar from './CategoriesBar'
import FiltresModal from './FiltresModal'

export default function FiltresBar({ selectedCategorieId, onSelectCategorie }) {
  const [categories, setCategories] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [headerHeight, setHeaderHeight] = useState(81)

  useEffect(() => {
    let cancelled = false

    apiFetch('/categories')
      .then((data) => {
        if (!cancelled) {
          setCategories(data ?? [])
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCategories([])
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    // Mesure la hauteur réelle du Header plutôt que de figer une valeur en dur :
    // celle-ci peut changer (ex. barre de recherche compacte insérée dans le Header
    // au scroll) et un décalage fixe se désynchronise silencieusement.
    function mesurerHeader() {
      const header = document.getElementById('site-header')
      if (header) {
        setHeaderHeight(header.offsetHeight)
      }
    }

    mesurerHeader()
    window.addEventListener('resize', mesurerHeader)
    return () => window.removeEventListener('resize', mesurerHeader)
  }, [])

  return (
    <div
      className="sticky z-30 border-b border-ink/10 bg-cream"
      style={{ top: headerHeight }}
    >
      <CategoriesBar
        selectedId={selectedCategorieId}
        onSelect={onSelectCategorie}
        categories={categories}
        prefix={
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex shrink-0 items-center gap-2 border-r border-ink/10 pr-3 text-sm font-semibold text-ink/70 transition-colors hover:text-cedre"
          >
            <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            Filtres
          </button>
        }
      />

      <FiltresModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
      />
    </div>
  )
}
