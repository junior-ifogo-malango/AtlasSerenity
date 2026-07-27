import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import apiFetch from "../../services/api"

export default function ReinitialiserMotDePasse() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get("token")
  const email = searchParams.get("email")

  const [password, setPassword] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setFieldErrors({})
    setIsSubmitting(true)

    try {
      await apiFetch("/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, token, password }),
      })
      navigate("/login")
    } catch (err) {
      if (err.status === 422 && err.data?.errors) {
        setFieldErrors(err.data.errors)
      } else {
        setError(
          err.status === 400
            ? t("auth.resetPassword.expiredOrInvalid")
            : t("common.genericError")
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!token || !email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-6">
        <div className="w-full max-w-sm text-center">
          <h1 className="font-fraunces text-3xl font-semibold leading-snug text-ink mb-4">
            {t("auth.resetPassword.invalidLinkTitle")}
          </h1>
          <p className="text-base text-ink/70">
            {t("auth.resetPassword.invalidLinkMessage")}
          </p>
          <Link
            to="/mot-de-passe-oublie"
            className="mt-4 inline-block text-base font-medium text-cedre hover:underline"
          >
            {t("auth.resetPassword.newRequestLink")}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="w-full max-w-md">
        <h1 className="font-fraunces text-3xl font-semibold leading-snug text-ink text-center mb-8">
          {t("auth.resetPassword.title")}
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border-2 border-cedre bg-white p-6 shadow-sm"
          noValidate
        >
          <div>
            <label htmlFor="password" className="block text-base font-medium text-ink mb-1">
              {t("auth.resetPassword.newPassword")}
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-ink/15 bg-white px-4 py-2 text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-cedre"
              placeholder={t("auth.resetPassword.passwordPlaceholder")}
            />
            {fieldErrors.password && (
              <p className="mt-1 text-base text-price" role="alert">
                {fieldErrors.password[0]}
              </p>
            )}
          </div>

          {error && (
            <p className="text-base text-price" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-cedre px-8 py-3 text-base font-medium text-cream shadow-md transition-colors hover:bg-cedre/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? t("auth.resetPassword.submitting") : t("auth.resetPassword.submit")}
          </button>
        </form>
      </div>
    </div>
  )
}
