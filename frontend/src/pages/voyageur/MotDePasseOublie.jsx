import { useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import apiFetch from "../../services/api"

export default function MotDePasseOublie() {
  const { t } = useTranslation()
  const [email, setEmail] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setFieldErrors({})
    setIsSubmitting(true)

    try {
      await apiFetch("/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      })
      setIsSubmitted(true)
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
    <div className="flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="w-full max-w-md">
        <h1 className="font-fraunces text-3xl font-semibold leading-snug text-ink text-center mb-8">
          {t("auth.forgotPassword.title")}
        </h1>

        {isSubmitted ? (
          <div className="rounded-lg border border-cedre/30 bg-cedre/5 p-4 text-center">
            <p className="text-base text-ink">
              {t("auth.forgotPassword.submittedMessage")}
            </p>
            <Link
              to="/login"
              className="mt-4 inline-block text-base font-medium text-cedre hover:underline"
            >
              {t("auth.forgotPassword.backToLogin")}
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-2xl border-2 border-cedre bg-white p-6 shadow-sm"
            noValidate
          >
            <p className="text-base text-ink/70">
              {t("auth.forgotPassword.intro")}
            </p>

            <div>
              <label htmlFor="email" className="block text-base font-medium text-ink mb-1">
                {t("common.email")}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-ink/15 bg-white px-4 py-2 text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-cedre"
                placeholder={t("common.emailPlaceholder")}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-base text-price" role="alert">
                  {fieldErrors.email[0]}
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
              {isSubmitting ? t("common.sending") : t("auth.forgotPassword.submit")}
            </button>

            <p className="text-center text-sm text-ink/70">
              <Link to="/login" className="font-medium text-cedre hover:underline">
                {t("auth.forgotPassword.backToLogin")}
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
