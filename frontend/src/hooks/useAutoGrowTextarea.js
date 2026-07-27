import { useLayoutEffect, useRef } from "react"

const DEFAULT_MAX_LIGNES = 9

export default function useAutoGrowTextarea(value, maxLignes = DEFAULT_MAX_LIGNES) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const textarea = ref.current
    if (!textarea) return

    textarea.style.height = "auto"

    const ligneHauteur = parseFloat(getComputedStyle(textarea).lineHeight)
    const hauteurMax = ligneHauteur * maxLignes

    textarea.style.height = `${Math.min(textarea.scrollHeight, hauteurMax)}px`
  }, [value, maxLignes])

  return ref
}
