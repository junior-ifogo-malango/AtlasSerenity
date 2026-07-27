// Formatage localisé partagé (prix, dates) — dépend de la langue active
// (i18n.language), passée explicitement par les appelants plutôt que lue
// ici, pour rester utilisable aussi bien en composant qu'ailleurs.

const CURRENCY_LOCALES = { fr: "fr-MA", en: "en-US" }
const DATE_LOCALES = { fr: "fr-FR", en: "en-US" }

export function getCurrencyLocale(lang) {
  return CURRENCY_LOCALES[lang] ?? CURRENCY_LOCALES.fr
}

export function getDateLocale(lang) {
  return DATE_LOCALES[lang] ?? DATE_LOCALES.fr
}

export function formatPrixMAD(prix, lang) {
  return new Intl.NumberFormat(getCurrencyLocale(lang), {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0,
  }).format(prix ?? 0)
}

export function formatHeureDispo(heureDispo) {
  return heureDispo.slice(0, 5)
}

export function formatDateDispo(dateDispo, lang) {
  return new Intl.DateTimeFormat(getDateLocale(lang), {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${dateDispo}T00:00:00`))
}
