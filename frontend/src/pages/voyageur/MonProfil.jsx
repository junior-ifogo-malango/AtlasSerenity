import { useEffect, useState } from "react"
import { Link, Navigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import Header from "../../components/layout/Header"
import Tabs from "../../components/ui/Tabs"
import ToggleSwitch from "../../components/ui/ToggleSwitch"
import { useAuth } from "../../context/AuthContext"
import apiFetch from "../../services/api"
import { STATUT_COMPTE_CLASSNAMES, STATUTS_COMPTE_LABEL_KEYS } from "../../constants/operateur"
import { getDateLocale } from "../../utils/format"

const ROLES = {
  voyageur: "auth.register.roleVoyageur",
  operateur: "auth.register.roleOperateur",
  admin: "admin.validation.roleAdmin",
}

function initiales(name) {
  return (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

function formatDepuis(dateString, lang) {
  if (!dateString) return "—"
  return new Intl.DateTimeFormat(getDateLocale(lang), { month: "long", year: "numeric" }).format(
    new Date(dateString)
  )
}

function IdentiteCard({ user, operateurStats, voyageurStats }) {
  const { t, i18n } = useTranslation()
  const statutInfo = STATUTS_COMPTE_LABEL_KEYS[user.statut_compte]
    ? {
        label: t(STATUTS_COMPTE_LABEL_KEYS[user.statut_compte]),
        className: STATUT_COMPTE_CLASSNAMES[user.statut_compte],
      }
    : {
        label: user.statut_compte,
        className: "bg-ink/10 text-ink",
      }

  const stats = [
    { label: t("profile.roleLabel"), value: ROLES[user.role] ? t(ROLES[user.role]) : user.role },
    { label: t("profile.memberSinceLabel"), value: formatDepuis(user.created_at, i18n.language) },
  ]

  if (user.role === "operateur") {
    stats.push(
      { label: t("profile.activitiesPublishedLabel"), value: operateurStats.activitesPubliees ?? "—" },
      { label: t("profile.averageRatingLabel"), value: operateurStats.noteMoyenne ?? "—" }
    )
  }

  if (user.role === "voyageur") {
    stats.push(
      { label: t("profile.reservationsMadeLabel"), value: voyageurStats.reservations ?? "—" },
      { label: t("nav.favorites"), value: voyageurStats.favoris ?? "—" }
    )
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm md:w-[280px] md:shrink-0">
      <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-sable font-fraunces text-2xl font-semibold text-cedre">
        {initiales(user.name)}
      </div>

      <p className="mt-4 font-fraunces text-lg font-semibold text-ink">{user.name}</p>
      <p className="text-sm text-ink/60">{user.email}</p>

      {user.role === "operateur" && (
        <span
          className={`mt-3 inline-block rounded-full px-3 py-1 text-sm font-medium ${statutInfo.className}`}
        >
          {statutInfo.label}
        </span>
      )}

      <dl className="mt-5 border-t border-ink/10">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center justify-between border-b border-ink/5 py-2.5 last:border-0"
          >
            <dt className="text-sm text-ink/60">{stat.label}</dt>
            <dd className="text-sm font-semibold text-ink">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function InformationsPanel({ user, updateUser }) {
  const { t } = useTranslation()
  const [name, setName] = useState(user.name ?? "")
  const [telephone, setTelephone] = useState(user.telephone ?? "")
  const [email, setEmail] = useState(user.email ?? "")
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setFieldErrors({})
    setSuccess(false)
    setIsSubmitting(true)

    try {
      const updated = await apiFetch(`/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify({ name, email, telephone }),
      })
      updateUser(updated)
      setSuccess(true)
    } catch (err) {
      if (err.status === 422 && err.data?.errors) {
        setFieldErrors(err.data.errors)
      } else {
        setError(t("common.genericError"))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-ink">
            {t("auth.register.name")}
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-[10px] border border-ink/15 bg-white px-4 py-2 text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-cedre"
          />
          {fieldErrors.name && (
            <p className="mt-1 text-sm text-argile" role="alert">
              {fieldErrors.name[0]}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="telephone" className="mb-1 block text-sm font-medium text-ink">
            {t("auth.register.phone")}
          </label>
          <input
            id="telephone"
            type="tel"
            autoComplete="tel"
            required={user.role === "operateur"}
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            className="w-full rounded-[10px] border border-ink/15 bg-white px-4 py-2 text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-cedre"
          />
          {fieldErrors.telephone && (
            <p className="mt-1 text-sm text-argile" role="alert">
              {fieldErrors.telephone[0]}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">
          {t("common.email")}
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-[10px] border border-ink/15 bg-white px-4 py-2 text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-cedre"
        />
        {fieldErrors.email && (
          <p className="mt-1 text-sm text-argile" role="alert">
            {fieldErrors.email[0]}
          </p>
        )}
      </div>

      {error && (
        <p className="text-sm text-argile" role="alert">
          {error}
        </p>
      )}

      {success && (
        <p className="text-sm text-cedre" role="status">
          {t("profile.updateSuccess")}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-cedre px-8 py-3 text-base font-medium text-cream shadow-md transition-colors hover:bg-cedre/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? t("profile.saving") : t("profile.saveChanges")}
      </button>
    </form>
  )
}

function SecuritePanel({ user }) {
  const { t } = useTranslation()
  const [currentPassword, setCurrentPassword] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setFieldErrors({})
    setSuccess(false)
    setIsSubmitting(true)

    try {
      await apiFetch(`/users/${user.id}/password`, {
        method: "PUT",
        body: JSON.stringify({
          current_password: currentPassword,
          password,
          password_confirmation: passwordConfirmation,
        }),
      })
      setCurrentPassword("")
      setPassword("")
      setPasswordConfirmation("")
      setSuccess(true)
    } catch (err) {
      if (err.status === 422 && err.data?.errors) {
        setFieldErrors(err.data.errors)
      } else {
        setError(t("common.genericError"))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-[420px] space-y-5" noValidate>
      <div>
        <label
          htmlFor="current_password"
          className="mb-1 block text-sm font-medium text-ink"
        >
          {t("profile.currentPassword")}
        </label>
        <input
          id="current_password"
          type="password"
          autoComplete="current-password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full rounded-[10px] border border-ink/15 bg-white px-4 py-2 text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-cedre"
        />
        {fieldErrors.current_password && (
          <p className="mt-1 text-sm text-argile" role="alert">
            {fieldErrors.current_password[0]}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="new_password" className="mb-1 block text-sm font-medium text-ink">
          {t("auth.resetPassword.newPassword")}
        </label>
        <input
          id="new_password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-[10px] border border-ink/15 bg-white px-4 py-2 text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-cedre"
        />
        {fieldErrors.password && (
          <p className="mt-1 text-sm text-argile" role="alert">
            {fieldErrors.password[0]}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="password_confirmation"
          className="mb-1 block text-sm font-medium text-ink"
        >
          {t("profile.confirmation")}
        </label>
        <input
          id="password_confirmation"
          type="password"
          autoComplete="new-password"
          required
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          className="w-full rounded-[10px] border border-ink/15 bg-white px-4 py-2 text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-cedre"
        />
      </div>

      {error && (
        <p className="text-sm text-argile" role="alert">
          {error}
        </p>
      )}

      {success && (
        <p className="text-sm text-cedre" role="status">
          {t("profile.passwordUpdateSuccess")}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-cedre px-8 py-3 text-base font-medium text-cream shadow-md transition-colors hover:bg-cedre/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? t("profile.updating") : t("profile.updatePassword")}
      </button>
    </form>
  )
}

function NotificationsPanel({ user, updateUser }) {
  const { t } = useTranslation()
  const [prefs, setPrefs] = useState({
    notif_reservations: user.notif_reservations ?? true,
    notif_messages: user.notif_messages ?? true,
    notif_newsletter: user.notif_newsletter ?? true,
  })

  async function handleToggle(field, value) {
    setPrefs((current) => ({ ...current, [field]: value }))
    try {
      const updated = await apiFetch(`/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify({ [field]: value }),
      })
      updateUser(updated)
    } catch {
      setPrefs((current) => ({ ...current, [field]: !value }))
    }
  }

  return (
    <div className="divide-y divide-ink/5">
      <ToggleSwitch
        label={t("profile.notifReservationsLabel")}
        description={t("profile.notifReservationsDescription")}
        checked={prefs.notif_reservations}
        onChange={(value) => handleToggle("notif_reservations", value)}
      />
      <ToggleSwitch
        label={t("profile.notifMessagesLabel")}
        description={t("profile.notifMessagesDescription")}
        checked={prefs.notif_messages}
        onChange={(value) => handleToggle("notif_messages", value)}
      />
      <ToggleSwitch
        label={t("profile.notifNewsletterLabel")}
        description={t("profile.notifNewsletterDescription")}
        checked={prefs.notif_newsletter}
        onChange={(value) => handleToggle("notif_newsletter", value)}
      />
    </div>
  )
}

export default function MonProfil() {
  const { t } = useTranslation()
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState("informations")
  const [operateurStats, setOperateurStats] = useState({})
  const [voyageurStats, setVoyageurStats] = useState({})

  useEffect(() => {
    if (!user || user.role !== "operateur") return

    let cancelled = false

    async function fetchStats() {
      try {
        const activites = await apiFetch(`/activites?id_operateur=${user.id}`)
        if (cancelled) return

        const publiees = activites.filter((activite) => activite.statut === "publie")
        const notes = publiees
          .map((activite) => Number(activite.note_moyenne))
          .filter((note) => Number.isFinite(note) && note > 0)

        setOperateurStats({
          activitesPubliees: publiees.length,
          noteMoyenne: notes.length > 0
            ? `${(notes.reduce((sum, note) => sum + note, 0) / notes.length).toFixed(1)} / 5`
            : "—",
        })
      } catch {
        if (!cancelled) {
          setOperateurStats({ activitesPubliees: "—", noteMoyenne: "—" })
        }
      }
    }

    fetchStats()

    return () => {
      cancelled = true
    }
  }, [user])

  useEffect(() => {
    if (!user || user.role !== "voyageur") return

    let cancelled = false

    async function fetchStats() {
      try {
        const [reservations, favoris] = await Promise.all([
          apiFetch(`/reservations?id_voyageur=${user.id}`),
          apiFetch(`/favoris?id_voyageur=${user.id}`),
        ])
        if (cancelled) return

        setVoyageurStats({
          reservations: reservations.length,
          favoris: favoris.length,
        })
      } catch {
        if (!cancelled) {
          setVoyageurStats({ reservations: "—", favoris: "—" })
        }
      }
    }

    fetchStats()

    return () => {
      cancelled = true
    }
  }, [user])

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const TABS = [
    { id: "informations", label: t("profile.tabInformations") },
    { id: "securite", label: t("profile.tabSecurity") },
    { id: "notifications", label: t("profile.tabNotifications") },
  ]

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <div className="mx-auto max-w-[1200px] px-6 py-10 md:px-8 md:py-12">
        <h1 className="mb-8 font-fraunces text-3xl font-semibold leading-snug text-ink">
          {t("profile.title")}
        </h1>

        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <IdentiteCard user={user} operateurStats={operateurStats} voyageurStats={voyageurStats} />

          <div className="min-w-0 flex-1 rounded-2xl border-2 border-cedre bg-white p-6 shadow-sm">
            <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

            <div className="mt-6">
              {activeTab === "informations" && (
                <InformationsPanel user={user} updateUser={updateUser} />
              )}
              {activeTab === "securite" && <SecuritePanel user={user} />}
              {activeTab === "notifications" && (
                <NotificationsPanel user={user} updateUser={updateUser} />
              )}
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-ink/70">
          <Link to="/mot-de-passe-oublie" className="font-medium text-cedre hover:underline">
            {t("auth.login.forgotPassword")}
          </Link>
        </p>
      </div>
    </div>
  )
}
