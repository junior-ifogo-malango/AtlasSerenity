export default function Tabs({ tabs, active, onChange }) {
  return (
    <div role="tablist" className="flex gap-4 overflow-x-auto border-b border-ink/10 sm:gap-6">
      {tabs.map((tab) => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`-mb-px shrink-0 whitespace-nowrap border-b-2 px-1 py-3 text-base font-medium transition-colors ${
              isActive
                ? "border-cedre text-cedre"
                : "border-transparent text-ink/60 hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
