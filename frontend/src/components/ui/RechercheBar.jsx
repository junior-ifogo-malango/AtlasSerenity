import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapPin } from 'lucide-react'
import apiFetch from '../../services/api'

export default function RechercheBar({ compact = false }) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [villes, setVilles] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const navigate = useNavigate()
  const searchRef = useRef(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    apiFetch('/villes')
      .then((data) => {
        if (!cancelled) {
          setVilles(data ?? [])
        }
      })
      .catch(() => {
        if (!cancelled) {
          setVilles([])
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(event) {
      const clickedInsideSearch = searchRef.current?.contains(event.target)
      const clickedInsideDropdown = dropdownRef.current?.contains(event.target)

      if (!clickedInsideSearch && !clickedInsideDropdown) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Le dropdown est monté via portail dans document.body (comme FiltresModal)
  // pour échapper à l'overflow-hidden du Hero, qui le tronquait sinon. Sa
  // position est donc recalculée manuellement à partir du champ de recherche.
  useLayoutEffect(() => {
    if (!showSuggestions) return

    function updateDropdownPosition() {
      if (!searchRef.current) return
      const rect = searchRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width,
      })
    }

    updateDropdownPosition()
    window.addEventListener('scroll', updateDropdownPosition, true)
    window.addEventListener('resize', updateDropdownPosition)

    return () => {
      window.removeEventListener('scroll', updateDropdownPosition, true)
      window.removeEventListener('resize', updateDropdownPosition)
    }
  }, [showSuggestions])

  const suggestions =
    query.trim().length > 0
      ? villes.filter((ville) => ville.nom.toLowerCase().includes(query.trim().toLowerCase()))
      : []

  function lancerRecherche(valeur) {
    setShowSuggestions(false)
    navigate(`/recherche?q=${encodeURIComponent(valeur.trim())}`)
  }

  function handleSubmit(event) {
    event.preventDefault()
    lancerRecherche(query)
  }

  function handleSelectSuggestion(ville) {
    setQuery(ville.nom)
    lancerRecherche(ville.nom)
  }

  return (
    <form onSubmit={handleSubmit} className={`mx-auto w-full ${compact ? 'max-w-md' : 'max-w-2xl'}`}>
      <div ref={searchRef} className="relative w-full">
        <div
          className={`flex items-center gap-2 rounded-full border border-ink/15 bg-white text-ink/60 shadow-sm ${
            compact ? 'py-1.5 pl-4 pr-1.5' : 'py-2 pl-5 pr-2'
          }`}
        >
          <svg
            className="h-4 w-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder={t('search.placeholder')}
            className="min-w-0 flex-1 bg-transparent text-base text-ink placeholder:text-ink/60 focus:outline-none"
          />
          <button
            type="submit"
            className={`shrink-0 rounded-full bg-price font-medium text-cream shadow-sm transition-colors hover:bg-price/90 ${
              compact ? 'px-4 py-2 text-sm' : 'px-4 py-2 text-sm sm:px-6 sm:py-2.5 sm:text-base'
            }`}
          >
            {compact ? (
              t('search.submitCompact')
            ) : (
              <>
                <span className="sm:hidden">{t('search.submitCompact')}</span>
                <span className="hidden sm:inline">{t('search.submit')}</span>
              </>
            )}
          </button>
        </div>

        {showSuggestions &&
          suggestions.length > 0 &&
          createPortal(
            <ul
              ref={dropdownRef}
              style={{
                position: 'absolute',
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
              }}
              className="z-50 max-h-72 space-y-1 overflow-y-auto rounded-2xl border border-ink/10 bg-white p-2 text-left shadow-lg"
            >
              {suggestions.map((ville) => (
                <li key={ville.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectSuggestion(ville)}
                    className="flex w-full items-center gap-3 rounded-xl border-2 border-transparent px-2 py-2 text-left transition-colors hover:border-cedre hover:bg-cream"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sable text-ink/60">
                      <MapPin className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-base font-medium text-ink">{ville.nom}</span>
                      {ville.region && (
                        <span className="block truncate text-sm text-ink/50">{ville.region}</span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>,
            document.body
          )}
      </div>
    </form>
  )
}
