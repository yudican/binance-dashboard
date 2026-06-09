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

/** Dummy signals — replace with a real feed later. */
export const DUMMY_SIGNALS: Signal[] = [
  {
    id: 'sig-1',
    pair: 'BTCUSDT',
    side: 'LONG',
    status: 'active',
    leverage: 10,
    confidence: 82,
    entry: 62840,
    targets: [63950, 65200, 67000],
    stopLoss: 61200,
    createdAgo: '2h ago',
    timeframe: '4H · reclaim of range low',
    thesis:
      'Price swept the $62.4k liquidity pocket and reclaimed the range low with a bullish engulfing on the 4H. Funding flipped negative while spot bid stepped in — favorable long against a tight invalidation.',
    reasons: [
      'Liquidity sweep + reclaim of $62.8k range low (HL printed)',
      'Funding negatif (shorts bayar) — supportive untuk long',
      'Volume divergence: sell volume turun di tiap leg bawah',
      'TP1 $63.95k sudah kena, SL sudah dinaikkan ke break-even',
    ],
    invalidation: '4H close di bawah $61.2k membatalkan reclaim → exit.',
  },
  {
    id: 'sig-2',
    pair: 'ETHUSDT',
    side: 'SHORT',
    status: 'active',
    leverage: 8,
    confidence: 74,
    entry: 3420,
    targets: [3360, 3280, 3180],
    stopLoss: 3510,
    createdAgo: '4h ago',
    timeframe: '1D · lower-high rejection',
    thesis:
      'ETH tagged the $3,420 supply zone and rejected with a lower high on the daily, aligning with broader bearish market structure. Short into the failed retest targeting the prior demand shelf.',
    reasons: [
      'Lower High (LH) di 1D — struktur bearish',
      'Rejection wick dari supply $3.42k',
      'BTC.D naik >55% — alt underperform vs BTC',
      'TP1 $3.36k tercapai',
    ],
    invalidation: '1D close di atas $3.51k = struktur bearish gagal.',
  },
  {
    id: 'sig-3',
    pair: 'SOLUSDT',
    side: 'LONG',
    status: 'pending',
    leverage: 12,
    confidence: 68,
    entry: 142.5,
    targets: [148.0, 154.5, 162.0],
    stopLoss: 136.8,
    createdAgo: '12m ago',
    timeframe: '1H · coiled spring',
    thesis:
      'SOL is coiling in a tightening range on the 1H with rising OI — a classic coiled-spring. Entry is a pending breakout-confirmation above $142.5; no fill yet.',
    reasons: [
      'Range menyempit di 1H dengan OI naik (coiled spring)',
      'Higher Low recovery setelah sweep $138',
      'Menunggu trigger: breakout + volume di atas $142.5',
      'RR favorable ke $148 / $154.5',
    ],
    invalidation: 'Tidak ada breakout dalam 6 jam atau drop < $136.8 → cancel.',
  },
  {
    id: 'sig-4',
    pair: 'BNBUSDT',
    side: 'LONG',
    status: 'closed',
    leverage: 6,
    confidence: 79,
    entry: 548.0,
    targets: [560, 575, 590],
    stopLoss: 532,
    createdAgo: '1d ago',
    timeframe: '4H · trend continuation',
    thesis:
      'Clean trend-continuation long off the $548 demand retest. Ran all three targets as BNB led the majors — full position closed at TP3.',
    reasons: [
      'Retest demand $548 dengan bullish reaction',
      'Trend 4H higher highs / higher lows intact',
      'Semua 3 TP tercapai, posisi closed penuh',
      'Outperform vs BTC sepanjang move',
    ],
    invalidation: 'Closed — semua target tercapai. Tidak ada posisi aktif.',
  },
  {
    id: 'sig-5',
    pair: 'XRPUSDT',
    side: 'SHORT',
    status: 'closed',
    leverage: 10,
    confidence: 65,
    entry: 0.624,
    targets: [0.61, 0.598, 0.58],
    stopLoss: 0.642,
    createdAgo: '1d ago',
    timeframe: '1H · failed breakdown',
    thesis:
      'Short the $0.624 breakdown that failed — price reclaimed the level and squeezed shorts. Stopped out at $0.642 for a planned loss; risk was capped.',
    reasons: [
      'Breakdown $0.624 gagal — fakeout / reclaim',
      'Short squeeze ke $0.643, SL kena',
      'Loss terkontrol sesuai risk plan (-1R)',
      'Pelajaran: butuh konfirmasi close, bukan wick',
    ],
    invalidation: 'Closed di SL $0.642. Idea invalidated oleh reclaim.',
  },
  {
    id: 'sig-6',
    pair: 'DOGEUSDT',
    side: 'LONG',
    status: 'active',
    leverage: 15,
    confidence: 71,
    entry: 0.1284,
    targets: [0.134, 0.141, 0.15],
    stopLoss: 0.1212,
    createdAgo: '6h ago',
    timeframe: '1H · momentum breakout',
    thesis:
      'Momentum breakout above $0.1284 with expanding volume and OI. Riding the impulse with a trailing stop after TP1; high leverage so risk is tightly managed.',
    reasons: [
      'Breakout $0.1284 dengan volume ekspansi',
      'OI naik konfirmasi partisipasi baru',
      'TP1 $0.134 kena, trailing stop aktif',
      'Social momentum tinggi (catalyst)',
    ],
    invalidation: 'Drop balik < $0.1212 = breakout gagal → exit.',
  },
  {
    id: 'sig-7',
    pair: 'AVAXUSDT',
    side: 'SHORT',
    status: 'pending',
    leverage: 9,
    confidence: 63,
    entry: 38.2,
    targets: [37.1, 35.8, 34.0],
    stopLoss: 39.9,
    createdAgo: '25m ago',
    timeframe: '4H · bear flag',
    thesis:
      'AVAX is consolidating in a bear flag below the $38.2 trendline after an impulsive leg down. Pending short on a breakdown of the flag; waiting for the trigger candle.',
    reasons: [
      'Bear flag konsolidasi di bawah trendline $38.2',
      'Impulse turun sebelumnya = leg lanjutan probable',
      'Menunggu breakdown flag dengan volume',
      'BTC.D >55% menekan alt seperti AVAX',
    ],
    invalidation: 'Break di atas $39.9 mematahkan flag → cancel.',
  },
  {
    id: 'sig-8',
    pair: 'LINKUSDT',
    side: 'LONG',
    status: 'active',
    leverage: 7,
    confidence: 77,
    entry: 16.42,
    targets: [17.1, 18.0, 19.2],
    stopLoss: 15.6,
    createdAgo: '3h ago',
    timeframe: '1D · accumulation breakout',
    thesis:
      'LINK is breaking out of a multi-week accumulation base on the daily. Entry on the retest of $16.42; structure supports a measured move toward $18+.',
    reasons: [
      'Breakout base akumulasi multi-minggu di 1D',
      'Retest $16.42 hold sebagai support baru',
      'Volume akumulasi naik bertahap',
      'Belum ada TP kena — posisi muda, runway besar',
    ],
    invalidation: '1D close < $15.6 = breakout gagal, kembali ke base.',
  },
]

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

export function getSignal(id: string): Signal | undefined {
  return DUMMY_SIGNALS.find((s) => s.id === id)
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
