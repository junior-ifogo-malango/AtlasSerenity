import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import apiFetch from "../../services/api"

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get("redirect")
  const registerHref = redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : "/register"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendSent, setResendSent] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setNeedsVerification(false)
    setResendSent(false)
    setIsSubmitting(true)

    try {
      await login(email, password)
      navigate(redirect || "/")
    } catch (err) {
      if (err.status === 403) {
        setNeedsVerification(true)
        setError(
          err.data?.message || "Veuillez vérifier votre adresse email avant de vous connecter."
        )
      } else {
        setError(
          err.status === 401 || err.status === 422
            ? "Email ou mot de passe incorrect."
            : "Une erreur est survenue. Veuillez réessayer."
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleResendVerification() {
    setIsResending(true)
    setResendSent(false)

    try {
      await apiFetch("/email/verification-notification", {
        method: "POST",
        body: JSON.stringify({ email }),
      })
      setResendSent(true)
    } catch {
      setError("Impossible de renvoyer l'email pour le moment. Veuillez réessayer.")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="w-full max-w-md">
        <h1 className="font-fraunces text-3xl font-semibold leading-snug text-ink text-center mb-8">
          Connexion
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border-2 border-cedre bg-white p-6 shadow-sm"
        >
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
          </div>

          <div>
            <label htmlFor="password" className="block text-base font-medium text-ink mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-ink/15 bg-white px-4 py-2 pr-11 text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-cedre"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((show) => !show)}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-ink/50 hover:text-ink"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                ) : (
                  <Eye className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                )}
              </button>
            </div>
            <Link
              to="/mot-de-passe-oublie"
              className="mt-1 inline-block text-sm font-medium text-cedre hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          {error && (
            <div className="space-y-2">
              <p className="text-base text-price" role="alert">
                {error}
              </p>
              {needsVerification && (
                resendSent ? (
                  <p className="text-base text-cedre">
                    Email de vérification renvoyé, consultez votre boîte mail.
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="text-base font-medium text-cedre hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isResending ? "Envoi..." : "Renvoyer l'email de vérification"}
                  </button>
                )
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-cedre px-8 py-3 text-base font-medium text-cream shadow-md transition-colors hover:bg-cedre/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Connexion..." : "Se connecter"}
          </button>

          <p className="text-center text-base text-ink/70">
            Pas encore de compte ?{" "}
            <Link to={registerHref} className="font-medium text-cedre hover:underline">
              Créer un compte
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
