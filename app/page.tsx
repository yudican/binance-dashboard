import Link from 'next/link'
import { Activity, Gem, LayoutDashboard, Radio, Target, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import SignalsBoard from '@/components/signals/SignalsBoard'
import { listSignals } from '@/lib/signalStore'
import { summarize } from '@/lib/signals'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function SignalsHome() {
  const signals = await listSignals()
  const summary = summarize(signals)

  return (
    <main className="relative z-10 mx-auto min-h-screen max-w-[1400px] space-y-5 px-3 py-6 sm:px-4 sm:py-8 lg:px-6 lg:py-10">
      {/* hero / nav */}
      <header className="flex flex-col gap-3 rounded-2xl border bg-black/40 p-3 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="orange-glow grid h-11 w-11 place-items-center rounded-xl border border-primary/70 bg-primary/10 text-primary">
            <Gem className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-wide sm:text-lg">
              FUTURES<span className="text-primary">DESK</span>
              <span className="ml-2 text-muted-foreground">Signals</span>
            </h1>
            <p className="text-xs text-muted-foreground">Live trade ideas · Binance USDT-M Futures</p>
          </div>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-4 text-sm font-medium text-primary transition hover:bg-primary/20"
        >
          <LayoutDashboard className="h-4 w-4" />
          Open Dashboard
        </Link>
      </header>

      {/* summary strip */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={<Radio />} label="Total Signals" value={String(summary.total)} />
        <Stat icon={<Activity />} label="Active Now" value={String(summary.active)} tone="accent" />
        <Stat icon={<Target />} label="Win Rate" value={`${summary.winRate.toFixed(0)}%`} tone="good" />
        <Stat icon={<TrendingUp />} label="Avg Gain" value={`+${summary.avgGain.toFixed(1)}%`} tone="good" />
      </section>

      <SignalsBoard signals={signals} />
    </main>
  )
}

function Stat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: string
  tone?: 'good' | 'accent'
}) {
  return (
    <Card className="metric-glow overflow-hidden pt-6">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-border bg-muted/30 text-muted-foreground [&>svg]:h-5 [&>svg]:w-5">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-[11px] text-muted-foreground">{label}</div>
          <div
            className={cn(
              'font-mono text-xl font-black tracking-tight sm:text-2xl',
              tone === 'good' && 'text-emerald-400',
              tone === 'accent' && 'text-primary'
            )}
          >
            {value}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
