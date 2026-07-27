const SUBTEXT_TONES = {
  argile: "text-argile",
  muted: "text-ink/60",
  cedre: "text-cedre",
}

export default function StatCard({ label, value, subtext, subtextTone = "muted" }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
      <p className="text-sm text-ink/60">{label}</p>
      <p className="mt-2 font-fraunces text-[26px] font-semibold leading-tight text-ink">
        {value}
      </p>
      {subtext && (
        <p className={`mt-1 text-sm ${SUBTEXT_TONES[subtextTone]}`}>{subtext}</p>
      )}
    </div>
  )
}
