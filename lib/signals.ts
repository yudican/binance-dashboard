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
  /** server-managed: how many targets live price has reached (auto-updated) */
  targetsHit: number
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

/**
 * Market symbol for price feeds: uppercase, alphanumerics only, USDT-quoted by
 * default. Bare base assets get a USDT suffix so they map to a real perp
 * (ENA -> ENAUSDT, BTC/USDT -> BTCUSDT, ETHUSDC -> ETHUSDC).
 */
export function normalizePair(pair: string): string {
  const s = pair.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (!s) return ''
  return /(USDT|USDC|USD)$/.test(s) ? s : `${s}USDT`
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

export interface LiveStatus {
  /** per-target: true once live price has reached/crossed it */
  tpHit: boolean[]
  /** count of targets reached */
  tpHitCount: number
  /** live price has reached/crossed the stop loss */
  stopHit: boolean
  /** signed % move from entry in the trade's favor (LONG up, SHORT down) */
  pnlPercent: number
}

/**
 * Evaluate a signal against a live price. Direction-aware: LONG profits up,
 * SHORT profits down. WATCH has no direction → no TP/stop evaluation.
 */
export function liveStatus(s: Signal, price: number | undefined): LiveStatus | null {
  if (price === undefined || !isFinite(price)) return null
  if (s.side === 'WATCH') {
    return { tpHit: s.targets.map(() => false), tpHitCount: 0, stopHit: false, pnlPercent: 0 }
  }
  const long = s.side === 'LONG'
  const tpHit = s.targets.map((t) => (long ? price >= t : price <= t))
  const stopHit = long ? price <= s.stopLoss : price >= s.stopLoss
  const pnlPercent = s.entry ? ((price - s.entry) / s.entry) * 100 * (long ? 1 : -1) : 0
  return { tpHit, tpHitCount: tpHit.filter(Boolean).length, stopHit, pnlPercent }
}
