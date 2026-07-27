import { createContext, useCallback, useContext, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Heart } from "lucide-react"

const ToastContext = createContext(null)

const DUREE_AFFICHAGE_MS = 2500

export function ToastProvider({ children }) {
  const [message, setMessage] = useState(null)
  const timeoutRef = useRef(null)

  const showToast = useCallback((texte) => {
    clearTimeout(timeoutRef.current)
    setMessage(texte)
    timeoutRef.current = setTimeout(() => setMessage(null), DUREE_AFFICHAGE_MS)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {message &&
        createPortal(
          <div
            role="status"
            className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-xl border border-ink/10 bg-white px-4 py-3 shadow-lg"
          >
            <Heart className="h-5 w-5 shrink-0 text-blue-600" fill="currentColor" strokeWidth={1.75} aria-hidden="true" />
            <span className="text-base font-medium text-ink">{message}</span>
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast doit être utilisé à l'intérieur d'un ToastProvider")
  }
  return context
}
