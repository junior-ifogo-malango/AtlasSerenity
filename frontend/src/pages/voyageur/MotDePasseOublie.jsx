import { useState } from "react"
import { Link } from "react-router-dom"
import apiFetch from "../../services/api"

export default function MotDePasseOublie() {
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
        setError("Une erreur est survenue. Veuillez réessayer.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="w-full max-w-md">
        <h1 className="font-fraunces text-3xl font-semibold leading-snug text-ink text-center mb-8">
          Mot de passe oublié
        </h1>

        {isSubmitted ? (
          <div className="rounded-lg border border-cedre/30 bg-cedre/5 p-4 text-center">
            <p className="text-base text-ink">
              Si un compte existe avec cette adresse email, un lien de réinitialisation vient
              de vous être envoyé.
            </p>
            <Link
              to="/login"
              className="mt-4 inline-block text-base font-medium text-cedre hover:underline"
            >
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-2xl border-2 border-cedre bg-white p-6 shadow-sm"
            noValidate
          >
            <p className="text-base text-ink/70">
              Indiquez votre adresse email, nous vous enverrons un lien pour réinitialiser
              votre mot de passe.
            </p>

            <div>
              <label htmlFor="email" className="block text-base font-medium text-ink mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-ink/15 bg-white px-4 py-2 text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-cedre"
                placeholder="vous@exemple.com"
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
              {isSubmitting ? "Envoi..." : "Envoyer le lien"}
            </button>

            <p className="text-center text-sm text-ink/70">
              <Link to="/login" className="font-medium text-cedre hover:underline">
                Retour à la connexion
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
