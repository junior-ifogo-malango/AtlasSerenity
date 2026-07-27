import { useEffect, useState } from "react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import apiFetch from "../../services/api"

export default function VerifierEmail() {
  const { id, hash } = useParams()
  const [searchParams] = useSearchParams()
  const expires = searchParams.get("expires")
  const signature = searchParams.get("signature")
  const [status, setStatus] = useState("loading")

  useEffect(() => {
    if (!id || !hash || !expires || !signature) {
      setStatus("error")
      return
    }

    apiFetch(`/email/verify/${id}/${hash}?expires=${expires}&signature=${signature}`)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"))
  }, [id, hash, expires, signature])

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-fraunces text-3xl font-semibold leading-snug text-ink mb-4">
          Vérification de l'email
        </h1>

        {status === "loading" && (
          <p className="text-base text-ink/70">Vérification en cours...</p>
        )}

        {status === "success" && (
          <div className="rounded-lg border border-cedre/30 bg-cedre/5 p-4">
            <p className="text-base text-ink">
              Votre adresse email a bien été vérifiée. Vous pouvez maintenant vous connecter.
            </p>
            <Link
              to="/login"
              className="mt-4 inline-block text-base font-medium text-cedre hover:underline"
            >
              Se connecter
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="rounded-lg border border-price/30 bg-price/5 p-4">
            <p className="text-base text-price">
              Ce lien de vérification est invalide ou a expiré.
            </p>
            <Link
              to="/login"
              className="mt-4 inline-block text-base font-medium text-cedre hover:underline"
            >
              Retour à la connexion
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
