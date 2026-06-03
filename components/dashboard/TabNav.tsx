'use client'

export type TabKey = 'overview' | 'positions' | 'income' | 'journal' | 'account'

interface Props {
  active: TabKey
  onChange: (k: TabKey) => void
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'positions', label: 'Positions & Orders' },
  { key: 'income', label: 'Income History' },
  { key: 'journal', label: 'Trade Journal' },
  { key: 'account', label: 'Account' },
]

export default function TabNav({ active, onChange }: Props) {
  return (
    <div className="border-b border-soft/40 overflow-x-auto tab-scroll">
      <div className="flex gap-1 min-w-max">
        {TABS.map((t) => {
          const isActive = t.key === active
          return (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              className={`relative px-4 py-3 text-[13px] tracking-wide transition whitespace-nowrap ${
                isActive
                  ? 'text-accent'
                  : 'text-muted2 hover:text-text'
              }`}
            >
              {t.label}
              <span
                className={`absolute left-3 right-3 -bottom-px h-[2px] rounded ${
                  isActive ? 'bg-accent' : 'bg-transparent'
                }`}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
