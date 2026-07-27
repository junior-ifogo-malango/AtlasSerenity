import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Check, Heart, Globe, Menu, ShoppingCart, User } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import RechercheBar from "../ui/RechercheBar"
import logo from "../../assets/atlasserenity-logo.png"

const NAV_ITEM_CLASSES =
  "flex flex-col items-center gap-1 font-sans text-base text-ink hover:text-price transition-colors"

const MOBILE_MENU_ITEM_CLASSES =
  "block rounded-lg px-3 py-2 text-sm text-ink hover:bg-cream"

function CompteMenu() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  async function handleLogout() {
    setIsOpen(false)
    await logout()
    navigate("/")
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={NAV_ITEM_CLASSES}
      >
        <User className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
        {user.name}
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-ink/10 bg-white py-1 text-ink shadow-md"
        >
          {user.role === "admin" && (
            <>
              <Link
                to="/admin/validation"
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-sm hover:bg-cream"
              >
                {t("nav.validation")}
              </Link>
              <Link
                to="/admin/dashboard"
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-sm hover:bg-cream"
              >
                {t("nav.crmDashboard")}
              </Link>
              <div className="my-1 border-t border-ink/10" />
            </>
          )}

          <Link
            to="/profil"
            role="menuitem"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 text-sm hover:bg-cream"
          >
            {t("nav.myProfile")}
          </Link>
          {user.role === "operateur" ? (
            <>
              <Link
                to="/operateur/dashboard"
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-sm hover:bg-cream"
              >
                {t("nav.operatorDashboard")}
              </Link>
              <Link
                to="/operateur/verification"
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-sm hover:bg-cream"
              >
                {t("nav.accountVerification")}
              </Link>
            </>
          ) : (
            <Link
              to="/mes-reservations"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm hover:bg-cream"
            >
              {t("nav.myReservations")}
            </Link>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="block w-full px-4 py-2 text-left text-sm text-price hover:bg-cream"
          >
            {t("nav.logout")}
          </button>
        </div>
      )}
    </div>
  )
}

function LangueMenu() {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleSelectLangue(langue) {
    i18n.changeLanguage(langue)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={NAV_ITEM_CLASSES}
      >
        <Globe className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
        {i18n.language === "en" ? "EN/MAD" : "FR/MAD"}
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-ink/10 bg-white py-1 text-ink shadow-md"
        >
          <button
            type="button"
            role="menuitemradio"
            aria-checked={i18n.language === "fr"}
            onClick={() => handleSelectLangue("fr")}
            className="flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm hover:bg-cream"
          >
            Français / MAD
            {i18n.language === "fr" && (
              <Check className="h-4 w-4 shrink-0 text-cedre" strokeWidth={2} aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            role="menuitemradio"
            aria-checked={i18n.language === "en"}
            onClick={() => handleSelectLangue("en")}
            className="flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm hover:bg-cream"
          >
            English / MAD
            {i18n.language === "en" && (
              <Check className="h-4 w-4 shrink-0 text-cedre" strokeWidth={2} aria-hidden="true" />
            )}
          </button>
        </div>
      )}
    </div>
  )
}

function MobileMenu({ isOpen, onClose }) {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const menuRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, onClose])

  async function handleLogout() {
    onClose()
    await logout()
    navigate("/")
  }

  if (!isOpen) return null

  return (
    <div
      ref={menuRef}
      className="border-t border-ink/10 bg-cream px-4 py-3 md:hidden"
    >
      <div className="mb-2 flex items-center justify-between px-3 py-2">
        <span className="flex items-center gap-2 text-sm font-medium text-ink">
          <Globe className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          {i18n.language === "en" ? "English / MAD" : "Français / MAD"}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => i18n.changeLanguage("fr")}
            aria-pressed={i18n.language === "fr"}
            className={`rounded-full px-2 py-1 text-xs font-medium transition-colors ${
              i18n.language === "fr" ? "bg-cedre text-cream" : "text-ink/60 hover:bg-white"
            }`}
          >
            FR
          </button>
          <button
            type="button"
            onClick={() => i18n.changeLanguage("en")}
            aria-pressed={i18n.language === "en"}
            className={`rounded-full px-2 py-1 text-xs font-medium transition-colors ${
              i18n.language === "en" ? "bg-cedre text-cream" : "text-ink/60 hover:bg-white"
            }`}
          >
            EN
          </button>
        </div>
      </div>

      <div className="my-1 border-t border-ink/10" />

      {user ? (
        <>
          {user.role === "admin" && (
            <>
              <Link to="/admin/validation" onClick={onClose} className={MOBILE_MENU_ITEM_CLASSES}>
                {t("nav.validation")}
              </Link>
              <Link to="/admin/dashboard" onClick={onClose} className={MOBILE_MENU_ITEM_CLASSES}>
                {t("nav.crmDashboard")}
              </Link>
            </>
          )}
          <Link to="/profil" onClick={onClose} className={MOBILE_MENU_ITEM_CLASSES}>
            {t("nav.myProfile")}
          </Link>
          {user.role === "operateur" ? (
            <>
              <Link to="/operateur/dashboard" onClick={onClose} className={MOBILE_MENU_ITEM_CLASSES}>
                {t("nav.operatorDashboard")}
              </Link>
              <Link to="/operateur/verification" onClick={onClose} className={MOBILE_MENU_ITEM_CLASSES}>
                {t("nav.accountVerification")}
              </Link>
            </>
          ) : (
            <Link to="/mes-reservations" onClick={onClose} className={MOBILE_MENU_ITEM_CLASSES}>
              {t("nav.myReservations")}
            </Link>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className={`w-full text-left text-price ${MOBILE_MENU_ITEM_CLASSES}`}
          >
            {t("nav.logout")}
          </button>
        </>
      ) : (
        <Link to="/login" onClick={onClose} className={MOBILE_MENU_ITEM_CLASSES}>
          {t("nav.login")}
        </Link>
      )}
    </div>
  )
}

export default function Header() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [afficherRecherche, setAfficherRecherche] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    function handleScroll() {
      const hero = document.getElementById("hero")
      const seuil = hero ? hero.offsetHeight : Infinity
      setAfficherRecherche(window.scrollY > seuil)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header id="site-header" className="sticky top-0 z-40 bg-cream border-b border-ink/10">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex items-center gap-4 py-3 md:gap-6">
          <Link to="/" className="flex shrink-0 items-center">
            <img src={logo} alt="AtlasSerenity" className="h-14 w-auto" />
          </Link>

          <div className="hidden flex-1 justify-center px-4 md:flex">
            {afficherRecherche && <RechercheBar compact />}
          </div>

          <nav className="flex flex-1 shrink-0 items-center justify-end gap-3 text-ink md:flex-none md:gap-8">
            <Link to="/favoris" className={NAV_ITEM_CLASSES}>
              <Heart className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
              <span className="hidden md:inline">{t("nav.favorites")}</span>
            </Link>
            {(!user || user?.role === "voyageur") && (
              <Link to="/mes-reservations" className={NAV_ITEM_CLASSES}>
                <ShoppingCart className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                <span className="hidden md:inline">{t("nav.reservations")}</span>
              </Link>
            )}

            <div className="hidden items-center gap-8 md:flex">
              <LangueMenu />
              {user ? (
                <CompteMenu />
              ) : (
                <Link to="/login" className={NAV_ITEM_CLASSES}>
                  <User className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                  {t("nav.login")}
                </Link>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={mobileMenuOpen}
              aria-label={t("nav.menu")}
              className="flex items-center justify-center text-ink hover:text-price md:hidden"
            >
              <Menu className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
            </button>
          </nav>
        </div>

        {afficherRecherche && (
          <div className="pb-3 md:hidden">
            <RechercheBar compact />
          </div>
        )}
      </div>

      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  )
}
