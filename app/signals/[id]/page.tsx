import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  CircleAlert,
  Clock,
  Gauge,
  ListChecks,
  Target,
  TrendingUp,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { MARKET_BIAS, riskReward, type Signal } from '@/lib/signals'
import { getSignalById } from '@/lib/signalStore'

export const dynamic = 'force-dynamic'

function fmtPrice(n: number) {
  const abs = Math.abs(n)
  const dec = abs >= 100 ? 2 : abs >= 1 ? 3 : 4
  return n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })
}

const STATUS_STYLES: Record<Signal['status'], string> = {
  active: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  pending: 'border-primary/30 bg-primary/10 text-primary',
  closed: 'border-border bg-muted/40 text-muted-foreground',
}

export default async function SignalDetailPage({ params }: { params: { id: string } }) {
  const signal = await getSignalById(params.id)
  if (!signal) notFound()

  const isLong = signal.side === 'LONG'
  const pnlPos = signal.pnlPercent >= 0
  const rr = riskReward(signal)
  const sideBg = isLong
    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
    : 'border-rose-500/30 bg-rose-500/10 text-rose-300'

  return (
    <main className="relative z-10 mx-auto min-h-screen max-w-[1100px] space-y-5 px-3 py-6 sm:px-4 sm:py-8 lg:px-6 lg:py-10">
      {/* back nav */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to signals
      </Link>

      {/* header */}
      <header className="flex flex-col gap-4 rounded-2xl border bg-black/40 p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-center gap-3">
          <div className={cn('grid h-12 w-12 shrink-0 place-items-center rounded-xl border', sideBg)}>
            {isLong ? <ArrowUpRight className="h-7 w-7" /> : <ArrowDownRight className="h-7 w-7" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-mono text-xl font-black tracking-tight sm:text-2xl">{signal.pair}</h1>
              <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-bold', sideBg)}>
                {signal.side}
              </span>
              <span
                className={cn(
                  'rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize',
                  STATUS_STYLES[signal.status]
                )}
              >
                {signal.status}
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {signal.timeframe} · {signal.createdAgo}
            </p>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <div className="text-[11px] text-muted-foreground">Return on margin</div>
          <div className={cn('font-mono text-3xl font-black', pnlPos ? 'text-emerald-400' : 'text-rose-400')}>
            {pnlPos ? '+' : ''}
            {signal.pnlPercent.toFixed(1)}%
          </div>
        </div>
      </header>

      {/* quick stats */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KeyStat icon={<Gauge />} label="Confidence" value={`${signal.confidence}%`} />
        <KeyStat icon={<TrendingUp />} label="Leverage" value={`${signal.leverage}x`} />
        <KeyStat icon={<Target />} label="Risk : Reward" value={`1 : ${rr.toFixed(1)}`} />
        <KeyStat icon={<ListChecks />} label="Targets Hit" value={`${signal.targetsHit}/${signal.targets.length}`} />
      </section>

      {/* thesis */}
      <Card>
        <CardHeader>
          <CardTitle>Trade Thesis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-foreground/90">{signal.thesis}</p>
        </CardContent>
      </Card>

      <section className="grid gap-5 lg:grid-cols-2">
        {/* trade levels */}
        <Card>
          <CardHeader>
            <CardTitle>Trade Levels</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <Level label="Entry" value={fmtPrice(signal.entry)} />
              <Level label={signal.status === 'closed' ? 'Exit' : 'Mark'} value={fmtPrice(signal.current)} accent />
              <Level label="Stop" value={fmtPrice(signal.stopLoss)} tone="bad" />
            </div>
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Target className="h-3.5 w-3.5" />
                Targets
              </div>
              <div className="space-y-2">
                {signal.targets.map((t, i) => {
                  const hit = i < signal.targetsHit
                  return (
                    <div
                      key={i}
                      className={cn(
                        'flex items-center justify-between rounded-lg border px-3 py-2 text-sm',
                        hit
                          ? 'border-emerald-500/40 bg-emerald-500/10'
                          : 'border-border bg-muted/20'
                      )}
                    >
                      <span className="text-muted-foreground">TP{i + 1}</span>
                      <span className={cn('font-mono font-semibold', hit ? 'text-emerald-300 line-through' : '')}>
                        {fmtPrice(t)}
                      </span>
                      <span
                        className={cn(
                          'rounded px-1.5 py-0.5 text-[10px] font-medium',
                          hit ? 'bg-emerald-500/20 text-emerald-300' : 'bg-muted/40 text-muted-foreground'
                        )}
                      >
                        {hit ? 'HIT' : 'OPEN'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* reasons */}
        <Card>
          <CardHeader>
            <CardTitle>Why This Setup</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {signal.reasons.map((r, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-foreground/90">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {r}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* invalidation */}
      <Card className="border-rose-500/20">
        <CardContent className="flex items-start gap-3 p-4 sm:p-5">
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
          <div>
            <div className="text-sm font-semibold text-rose-300">Invalidation</div>
            <p className="mt-1 text-sm text-foreground/90">{signal.invalidation}</p>
          </div>
        </CardContent>
      </Card>

      {/* market bias */}
      <Card>
        <CardHeader>
          <CardTitle>Market Bias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <Bias
              label="BTC"
              value={`$${MARKET_BIAS.btcPrice.toLocaleString('en-US')}`}
              sub={`+${MARKET_BIAS.btcChange}%`}
              tone="good"
            />
            <Bias
              label="BTC Dominance"
              value={`${MARKET_BIAS.btcDominance}%`}
              sub=">55% ⚠️"
              tone="warn"
            />
            <Bias label="Total MCap" value={MARKET_BIAS.totalMcap} sub={`+${MARKET_BIAS.mcapChange}%`} tone="good" />
            <Bias
              label="Fear & Greed"
              value={`${MARKET_BIAS.fearGreed}/100`}
              sub={MARKET_BIAS.fearGreedLabel}
              tone="bad"
            />
            <Bias label="Regime" value={MARKET_BIAS.classification} sub={MARKET_BIAS.protocol} tone="accent" />
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

function KeyStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="metric-glow pt-4">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border bg-muted/30 text-muted-foreground [&>svg]:h-4 [&>svg]:w-4">
          {icon}
        </div>
        <div>
          <div className="text-[11px] text-muted-foreground">{label}</div>
          <div className="font-mono text-lg font-black tracking-tight">{value}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function Level({
  label,
  value,
  accent,
  tone,
}: {
  label: string
  value: string
  accent?: boolean
  tone?: 'bad'
}) {
  return (
    <div className="rounded-lg border bg-muted/20 px-2 py-3">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div
        className={cn(
          'mt-1 font-mono text-sm font-bold',
          accent && 'text-primary',
          tone === 'bad' && 'text-rose-400'
        )}
      >
        {value}
      </div>
    </div>
  )
}

function Bias({
  label,
  value,
  sub,
  tone,
}: {
  label: string
  value: string
  sub: string
  tone?: 'good' | 'bad' | 'warn' | 'accent'
}) {
  const toneCls =
    tone === 'good'
      ? 'text-emerald-400'
      : tone === 'bad'
      ? 'text-rose-400'
      : tone === 'warn'
      ? 'text-orange-400'
      : tone === 'accent'
      ? 'text-primary'
      : ''
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono text-base font-bold tracking-tight">{value}</div>
      <div className={cn('mt-0.5 text-[11px]', toneCls)}>{sub}</div>
    </div>
  )
}
