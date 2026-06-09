import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  CircleAlert,
  Eye,
  Clock,
  Gauge,
  Target,
  TrendingUp,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import SignalLive from '@/components/signals/SignalLive'
import { cn } from '@/lib/utils'
import { MARKET_BIAS, riskReward, type Signal } from '@/lib/signals'
import { getSignalById } from '@/lib/signalStore'

export const dynamic = 'force-dynamic'

const STATUS_STYLES: Record<Signal['status'], string> = {
  active: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  pending: 'border-primary/30 bg-primary/10 text-primary',
  closed: 'border-border bg-muted/40 text-muted-foreground',
}

const SIDE_STYLES: Record<Signal['side'], string> = {
  LONG: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  SHORT: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
  WATCH: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300',
}

const SIDE_ICON = {
  LONG: ArrowUpRight,
  SHORT: ArrowDownRight,
  WATCH: Eye,
}

export default async function SignalDetailPage({ params }: { params: { id: string } }) {
  const signal = await getSignalById(params.id)
  if (!signal) notFound()

  const rr = riskReward(signal)
  const sideBg = SIDE_STYLES[signal.side]
  const SideIcon = SIDE_ICON[signal.side]

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
            <SideIcon className="h-7 w-7" />
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
      </header>

      {/* quick stats */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <KeyStat icon={<Gauge />} label="Confidence" value={`${signal.confidence}%`} />
        <KeyStat icon={<TrendingUp />} label="Leverage" value={`${signal.leverage}x`} />
        <KeyStat icon={<Target />} label="Risk : Reward" value={`1 : ${rr.toFixed(1)}`} />
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
        {/* trade levels (live) */}
        <SignalLive signal={signal} />

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
