import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Chart as ChartJS, registerables } from "chart.js"
import { Line, Bar, Pie } from "react-chartjs-2"
import { LayoutGrid, CheckSquare, Users, ListChecks } from "lucide-react"
import Header from "../../components/layout/Header"
import SidebarNav from "../../components/ui/SidebarNav"
import StatCard from "../../components/ui/StatCard"
import { useAuth } from "../../context/AuthContext"
import apiFetch from "../../services/api"
import { formatPrixMAD, getDateLocale } from "../../utils/format"

ChartJS.register(...registerables)

const PALETTE = ["#2d4a3e", "#b85c38", "#dda15e", "#8fae95", "#6b8f7a", "#8a5a44"]

const CHART_FONT = { family: "Lato, ui-sans-serif, system-ui, sans-serif", size: 13 }

const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false, labels: { font: CHART_FONT } },
    tooltip: { titleFont: CHART_FONT, bodyFont: CHART_FONT },
  },
  scales: {
    x: { ticks: { font: CHART_FONT } },
    y: { ticks: { font: CHART_FONT } },
  },
}

const HORIZONTAL_BAR_OPTIONS = {
  ...CHART_OPTIONS,
  indexAxis: "y",
}

const PIE_CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { font: CHART_FONT } },
    tooltip: { titleFont: CHART_FONT, bodyFont: CHART_FONT },
  },
}

function formatMois(mois, lang) {
  return new Intl.DateTimeFormat(getDateLocale(lang), { month: "short", year: "numeric" }).format(
    new Date(`${mois}-01T00:00:00`)
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
      <h2 className="mb-4 font-fraunces text-lg font-semibold text-ink">{title}</h2>
      <div className="h-64">{children}</div>
    </div>
  )
}

export default function DashboardCRM() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()

  const SIDEBAR_ITEMS = [
    { label: t("nav.crmDashboard"), to: "/admin/dashboard", icon: LayoutGrid },
    { label: t("admin.dashboard.sidebarValidations"), to: "/admin/validation", icon: CheckSquare },
    { label: t("admin.dashboard.sidebarUsers"), icon: Users, disabled: true },
    { label: t("admin.dashboard.sidebarActivities"), icon: ListChecks, disabled: true },
  ]
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user || user.role !== "admin") return

    let cancelled = false

    async function fetchStats() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await apiFetch("/admin/stats/dashboard")
        if (!cancelled) {
          setStats(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchStats()

    return () => {
      cancelled = true
    }
  }, [user])

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-cream">
        <Header />
        <p className="mx-auto max-w-4xl px-6 py-12 text-ink/70">
          {t("admin.validation.adminOnly")}
        </p>
      </div>
    )
  }

  const reservationsData = stats && {
    labels: stats.reservations_par_mois.map((item) => formatMois(item.mois, i18n.language)),
    datasets: [
      {
        label: t("admin.dashboard.reservationsDatasetLabel"),
        data: stats.reservations_par_mois.map((item) => Number(item.total)),
        borderColor: "#2d4a3e",
        backgroundColor: "#2d4a3e",
        tension: 0.3,
      },
    ],
  }

  const revenusData = stats && {
    labels: stats.revenus_par_mois.map((item) => formatMois(item.mois, i18n.language)),
    datasets: [
      {
        label: t("admin.dashboard.revenueDatasetLabel"),
        data: stats.revenus_par_mois.map((item) => Number(item.total)),
        backgroundColor: "#b85c38",
        borderRadius: 6,
      },
    ],
  }

  const categoriesData = stats && {
    labels: stats.activites_par_categorie.map((item) => item.categorie),
    datasets: [
      {
        data: stats.activites_par_categorie.map((item) => Number(item.total)),
        backgroundColor: stats.activites_par_categorie.map(
          (_, index) => PALETTE[index % PALETTE.length]
        ),
      },
    ],
  }

  const regionsData = stats && {
    labels: stats.activites_par_region.map((item) => item.region),
    datasets: [
      {
        label: t("admin.dashboard.activitiesDatasetLabel"),
        data: stats.activites_par_region.map((item) => Number(item.total)),
        backgroundColor: "#2d4a3e",
        borderRadius: 6,
      },
    ],
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-6 md:flex-row md:gap-0 md:px-0 md:py-0">
        <SidebarNav title={t("admin.dashboard.sidebarTitle")} items={SIDEBAR_ITEMS} />

        <div className="min-w-0 flex-1 px-2 py-4 md:max-w-[1200px] md:px-10 md:py-10">
          <h1 className="font-fraunces text-3xl font-semibold leading-snug text-ink">
            {t("admin.dashboard.title")}
          </h1>
          <p className="mt-1 text-base text-ink/60">
            {t("admin.dashboard.subtitle")}
          </p>

          {error && (
            <p className="mt-6 text-argile" role="alert">
              {t("admin.dashboard.loadError")}
            </p>
          )}

          {isLoading && !error && <p className="mt-6 text-ink/70">{t("common.loading")}</p>}

          {!isLoading && !error && stats && (
            <div className="mt-8 space-y-8">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label={t("admin.dashboard.pendingAccounts")}
                  value={stats.comptes_en_attente}
                  subtext={stats.comptes_en_attente > 0 ? t("admin.dashboard.actionRequired") : t("admin.dashboard.noPendingAccounts")}
                  subtextTone={stats.comptes_en_attente > 0 ? "argile" : "muted"}
                />
                <StatCard
                  label={t("admin.dashboard.globalAverageRating")}
                  value={stats.note_moyenne_globale !== null ? `${stats.note_moyenne_globale} / 5` : "—"}
                  subtext={stats.note_moyenne_globale === null ? t("admin.dashboard.noReviewsYet") : null}
                  subtextTone="muted"
                />
                <StatCard
                  label={t("admin.dashboard.reservationsThisMonth")}
                  value={stats.reservations_ce_mois}
                  subtext={t("admin.dashboard.thisMonth")}
                  subtextTone="muted"
                />
                <StatCard
                  label={t("admin.dashboard.revenueThisMonth")}
                  value={formatPrixMAD(stats.revenus_ce_mois, i18n.language)}
                  subtext={t("admin.dashboard.thisMonth")}
                  subtextTone="muted"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ChartCard title={t("admin.dashboard.reservationsByMonth")}>
                  <Line data={reservationsData} options={CHART_OPTIONS} />
                </ChartCard>

                <ChartCard title={t("admin.dashboard.revenueByMonth")}>
                  <Bar data={revenusData} options={CHART_OPTIONS} />
                </ChartCard>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ChartCard title={t("admin.dashboard.byCategoryBreakdown")}>
                  <Pie data={categoriesData} options={PIE_CHART_OPTIONS} />
                </ChartCard>

                <ChartCard title={t("admin.dashboard.byRegionBreakdown")}>
                  <Bar data={regionsData} options={HORIZONTAL_BAR_OPTIONS} />
                </ChartCard>
              </div>

              <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
                <h2 className="mb-4 font-fraunces text-lg font-semibold text-ink">
                  {t("admin.dashboard.topActivities")}
                </h2>
                {stats.top_activites.length === 0 ? (
                  <p className="text-ink/70">{t("admin.dashboard.noDataAvailable")}</p>
                ) : (
                  <div className="divide-y divide-ink/5">
                    {stats.top_activites.map((activite, index) => (
                      <div key={activite.id} className="flex items-center gap-4 py-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-ink/10 text-sm font-semibold text-ink/60">
                          {index + 1}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-base text-ink">
                          {activite.titre}
                        </span>
                        <span className="shrink-0 text-base font-semibold text-argile">
                          {activite.reservations_count}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
