export type SignalSide = 'LONG' | 'SHORT' | 'WATCH'
export type SignalStatus = 'active' | 'pending' | 'closed'

export interface Signal {
  id: string
  pair: string
  side: SignalSide
  status: SignalStatus
  leverage: number
  /** 0-100 model confidence */
  confidence: number
  entry: number
  /** price targets in order */
  targets: number[]
  stopLoss: number
  /** relative timestamp label */
  createdAgo: string
  /** one-line trade thesis shown on the detail page */
  thesis: string
  /** bullet reasons the setup triggered */
  reasons: string[]
  /** what kills the idea */
  invalidation: string
  /** timeframe / structure note */
  timeframe: string
}

/** Snapshot of the macro read shared across all signals. */
export const MARKET_BIAS = {
  btcPrice: 63280,
  btcChange: 0.89,
  btcDominance: 56.1,
  totalMcap: '$2.26T',
  mcapChange: 1.01,
  fearGreed: 10,
  fearGreedLabel: 'Extreme Fear',
  classification: 'SIDEWAYS',
  protocol: 'Sideways Protocol aktif',
} as const

export interface SignalSummary {
  total: number
  active: number
  long: number
  short: number
}

export function summarize(signals: Signal[]): SignalSummary {
  return {
    total: signals.length,
    active: signals.filter((s) => s.status === 'active').length,
    long: signals.filter((s) => s.side === 'LONG').length,
    short: signals.filter((s) => s.side === 'SHORT').length,
  }
}

/** Relative time label from an epoch-ms timestamp. */
export function timeAgo(ts: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000))
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

/** Reward-to-risk using the first target. */
export function riskReward(s: Signal): number {
  const reward = Math.abs(s.targets[0] - s.entry)
  const risk = Math.abs(s.entry - s.stopLoss)
  return risk ? reward / risk : 0
}
