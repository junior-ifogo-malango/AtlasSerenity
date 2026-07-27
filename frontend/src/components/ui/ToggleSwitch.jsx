export default function ToggleSwitch({ checked, onChange, label, description, disabled = false }) {
  return (
    <label className="flex items-center justify-between gap-4 py-3">
      <span className="min-w-0">
        <span className="block text-base font-medium text-ink">{label}</span>
        {description && (
          <span className="block text-sm text-ink/60">{description}</span>
        )}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-[22px] w-10 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          checked ? "bg-cedre" : "bg-ink/15"
        }`}
      >
        <span
          className={`absolute left-[3px] top-[3px] h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-[18px]" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  )
}
