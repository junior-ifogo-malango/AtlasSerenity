import { NavLink } from "react-router-dom"
import { useTranslation } from "react-i18next"

export default function SidebarNav({ title, items }) {
  const { t } = useTranslation()
  return (
    <nav className="w-full shrink-0 rounded-2xl bg-cedre p-5 text-cream md:w-[220px] md:rounded-none md:p-6">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-cream/60">
        {title}
      </p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.label}>
            {item.disabled ? (
              <span className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-cream/40">
                <item.icon className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span className="flex-1 text-base">{item.label}</span>
                <span className="text-xs">{t("sidebar.comingSoon")}</span>
              </span>
            ) : (
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-base transition-colors ${
                    isActive ? "bg-white/10 text-cream" : "text-cream/80 hover:bg-white/5 hover:text-cream"
                  }`
                }
              >
                <item.icon className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                {item.label}
              </NavLink>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
