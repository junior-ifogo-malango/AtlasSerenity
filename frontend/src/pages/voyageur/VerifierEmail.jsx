import { useEffect, useState } from "react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import apiFetch from "../../services/api"

export default function VerifierEmail() {
  const { t } = useTranslation()
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
          {t("auth.verifyEmail.title")}
        </h1>

        {status === "loading" && (
          <p className="text-base text-ink/70">{t("auth.verifyEmail.verifying")}</p>
        )}

        {status === "success" && (
          <div className="rounded-lg border border-cedre/30 bg-cedre/5 p-4">
            <p className="text-base text-ink">
              {t("auth.verifyEmail.success")}
            </p>
            <Link
              to="/login"
              className="mt-4 inline-block text-base font-medium text-cedre hover:underline"
            >
              {t("auth.login.submit")}
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="rounded-lg border border-price/30 bg-price/5 p-4">
            <p className="text-base text-price">
              {t("auth.verifyEmail.failure")}
            </p>
            <Link
              to="/login"
              className="mt-4 inline-block text-base font-medium text-cedre hover:underline"
            >
              {t("auth.forgotPassword.backToLogin")}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
