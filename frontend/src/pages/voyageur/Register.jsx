import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import { useAuth } from "../../context/AuthContext"

const ROLES = [
  { value: "voyageur", label: "Voyageur" },
  { value: "operateur", label: "Opérateur" },
]

const TYPES_OPERATEUR = [
  { value: "guide", label: "Guide indépendant" },
  { value: "entreprise", label: "Entreprise" },
]

export default function Register() {
  const { register } = useAuth()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get("redirect")
  const loginHref = redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login"
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState("voyageur")
  const [telephone, setTelephone] = useState("")
  const [typeOperateur, setTypeOperateur] = useState("guide")
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setFieldErrors({})
    setIsSubmitting(true)

    try {
      await register({
        name,
        email,
        password,
        role,
        telephone: role === "operateur" ? telephone : "",
        type_operateur: role === "operateur" ? typeOperateur : "",
      })
      setIsRegistered(true)
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

  if (isRegistered) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-6">
        <div className="w-full max-w-sm text-center">
          <h1 className="font-fraunces text-3xl font-semibold leading-snug text-ink mb-4">
            Vérifiez votre email
          </h1>
          <div className="rounded-lg border border-cedre/30 bg-cedre/5 p-4">
            <p className="text-base text-ink">
              Un email de vérification a été envoyé à{" "}
              <span className="font-medium">{email}</span>. Cliquez sur le lien qu'il contient
              pour activer votre compte.
            </p>
          </div>
          <Link
            to={loginHref}
            className="mt-4 inline-block text-base font-medium text-cedre hover:underline"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="w-full max-w-md">
        <h1 className="font-fraunces text-3xl font-semibold leading-snug text-ink text-center mb-8">
          Inscription
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-2xl border-2 border-cedre bg-white p-6 shadow-sm"
          noValidate
        >
          <div>
            <label htmlFor="name" className="block text-base font-medium text-ink mb-1">
              Nom
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border-2 border-ink/15 bg-white px-4 py-2 text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-cedre"
              placeholder="Votre nom"
            />
            {fieldErrors.name && (
              <p className="mt-1 text-base text-price" role="alert">
                {fieldErrors.name[0]}
              </p>
            )}
          </div>

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
              className="w-full rounded-lg border-2 border-ink/15 bg-white px-4 py-2 text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-cedre"
              placeholder="vous@exemple.com"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-base text-price" role="alert">
                {fieldErrors.email[0]}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-base font-medium text-ink mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border-2 border-ink/15 bg-white px-4 py-2 pr-11 text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-cedre"
                placeholder="8 caractères minimum"
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
            {fieldErrors.password && (
              <p className="mt-1 text-base text-price" role="alert">
                {fieldErrors.password[0]}
              </p>
            )}
          </div>

          <div>
            <span className="block text-base font-medium text-ink mb-2">
              Je suis un(e)
            </span>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRole(option.value)}
                  aria-pressed={role === option.value}
                  className={`rounded-lg border px-4 py-2 text-base font-medium transition-colors ${
                    role === option.value
                      ? "border-cedre bg-cedre text-cream"
                      : "border-ink/15 bg-white text-ink hover:border-cedre/50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {fieldErrors.role && (
              <p className="mt-1 text-base text-price" role="alert">
                {fieldErrors.role[0]}
              </p>
            )}
          </div>

          {role === "operateur" && (
            <div>
              <label htmlFor="telephone" className="block text-base font-medium text-ink mb-1">
                Téléphone
              </label>
              <input
                id="telephone"
                type="tel"
                autoComplete="tel"
                required
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="w-full rounded-lg border-2 border-ink/15 bg-white px-4 py-2 text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-cedre"
                placeholder="+212 6XX XXXXXX"
              />
              {fieldErrors.telephone && (
                <p className="mt-1 text-base text-price" role="alert">
                  {fieldErrors.telephone[0]}
                </p>
              )}
            </div>
          )}

          {role === "operateur" && (
            <div>
              <span className="block text-base font-medium text-ink mb-2">
                Type d'activité
              </span>
              <div className="grid grid-cols-2 gap-2">
                {TYPES_OPERATEUR.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTypeOperateur(option.value)}
                    aria-pressed={typeOperateur === option.value}
                    className={`rounded-lg border px-4 py-2 text-base font-medium transition-colors ${
                      typeOperateur === option.value
                        ? "border-cedre bg-cedre text-cream"
                        : "border-ink/15 bg-white text-ink hover:border-cedre/50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {fieldErrors.type_operateur && (
                <p className="mt-1 text-base text-price" role="alert">
                  {fieldErrors.type_operateur[0]}
                </p>
              )}
            </div>
          )}

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
            {isSubmitting ? "Inscription..." : "Créer mon compte"}
          </button>

          <p className="text-center text-base text-ink/70">
            Déjà un compte ?{" "}
            <Link to={loginHref} className="font-medium text-cedre hover:underline">
              Se connecter
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
