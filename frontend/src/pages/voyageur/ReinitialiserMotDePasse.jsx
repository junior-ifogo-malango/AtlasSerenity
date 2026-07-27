import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import apiFetch from "../../services/api"

export default function ReinitialiserMotDePasse() {
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
            ? "Ce lien de réinitialisation est invalide ou a expiré. Veuillez refaire une demande."
            : "Une erreur est survenue. Veuillez réessayer."
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
            Lien invalide
          </h1>
          <p className="text-base text-ink/70">
            Ce lien de réinitialisation est invalide ou incomplet.
          </p>
          <Link
            to="/mot-de-passe-oublie"
            className="mt-4 inline-block text-base font-medium text-cedre hover:underline"
          >
            Faire une nouvelle demande
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="w-full max-w-md">
        <h1 className="font-fraunces text-3xl font-semibold leading-snug text-ink text-center mb-8">
          Réinitialiser le mot de passe
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border-2 border-cedre bg-white p-6 shadow-sm"
          noValidate
        >
          <div>
            <label htmlFor="password" className="block text-base font-medium text-ink mb-1">
              Nouveau mot de passe
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-ink/15 bg-white px-4 py-2 text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-cedre"
              placeholder="8 caractères minimum"
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
            {isSubmitting ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
          </button>
        </form>
      </div>
    </div>
  )
}
