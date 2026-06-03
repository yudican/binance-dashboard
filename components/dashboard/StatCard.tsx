'use client'

type BorderColor = 'yellow' | 'green' | 'red' | 'blue' | 'orange'
type ValueColor = 'pos' | 'neg' | 'neutral' | 'accent' | 'auto'

interface Props {
  label: string
  value: string
  sub?: string
  color: BorderColor
  valueColor?: ValueColor
  /** For 'auto', supply the raw number so the component picks pos/neg. */
  rawValue?: number
}

const BORDER_COLOR: Record<BorderColor, string> = {
  yellow: '#f0b90b',
  green: '#0ecb81',
  red: '#f6465d',
  blue: '#1890ff',
  orange: '#f77f00',
}

export default function StatCard({
  label,
  value,
  sub,
  color,
  valueColor = 'neutral',
  rawValue,
}: Props) {
  const auto =
    valueColor === 'auto'
      ? rawValue !== undefined
        ? rawValue > 0
          ? 'pos'
          : rawValue < 0
          ? 'neg'
          : 'neutral'
        : 'neutral'
      : valueColor

  const valueCls =
    auto === 'pos'
      ? 'text-gain'
      : auto === 'neg'
      ? 'text-loss'
      : auto === 'accent'
      ? 'text-accent'
      : 'text-text'

  return (
    <div
      className="card-base relative px-4 py-3.5 overflow-hidden hover:bg-card2 transition-colors"
      style={{
        boxShadow:
          '0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 20px rgba(0,0,0,0.30)',
      }}
    >
      <span
        aria-hidden
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: BORDER_COLOR[color] }}
      />
      <div className="text-[10.5px] uppercase tracking-[0.12em] text-muted2 font-medium">
        {label}
      </div>
      <div className={`mt-1.5 text-[20px] leading-tight tnum font-semibold ${valueCls}`}>
        {value}
      </div>
      {sub && (
        <div className="mt-1 text-[11px] text-muted tnum truncate">{sub}</div>
      )}
    </div>
  )
}
