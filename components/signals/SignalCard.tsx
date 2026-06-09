import Link from 'next/link'
import { ArrowDownRight, ArrowUpRight, ChevronRight, Eye, Target } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Signal } from '@/lib/signals'

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

export default function SignalCard({ signal }: { signal: Signal }) {
  const sideBg = SIDE_STYLES[signal.side]
  const SideIcon = SIDE_ICON[signal.side]

  return (
    <Link href={`/signals/${signal.id}`} className="group block">
    <Card className="flex h-full flex-col gap-4 p-4 transition hover:border-primary/40 hover:bg-card sm:p-5">
      {/* header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'grid h-9 w-9 shrink-0 place-items-center rounded-lg border',
              sideBg
            )}
          >
            <SideIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="font-mono text-sm font-bold tracking-tight">{signal.pair}</div>
            <div className="text-[11px] text-muted-foreground">{signal.createdAgo}</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide', sideBg)}>
            {signal.side}
          </span>
          <span
            className={cn(
              'rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize',
              STATUS_STYLES[signal.status]
            )}
          >
            {signal.status}
          </span>
        </div>
      </div>

      {/* leverage + confidence */}
      <div className="flex items-center gap-3">
        <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-1 font-mono text-xs font-semibold text-primary">
          {signal.leverage}x
        </span>
        <div className="flex-1">
          <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
            <span>Confidence</span>
            <span className="tnum">{signal.confidence}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary/70 to-emerald-400"
              style={{ width: `${signal.confidence}%` }}
            />
          </div>
        </div>
      </div>

      {/* price grid */}
      <div className="grid grid-cols-2 gap-2 text-center">
        <PriceCell label="Entry" value={fmtPrice(signal.entry)} accent />
        <PriceCell label="Stop" value={fmtPrice(signal.stopLoss)} tone="bad" />
      </div>

      {/* targets */}
      <div>
        <div className="mb-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Target className="h-3.5 w-3.5" />
          <span>Targets · {signal.targets.length}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {signal.targets.map((t, i) => (
            <span
              key={i}
              className="rounded-md border border-border bg-muted/30 px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
            >
              TP{i + 1} {fmtPrice(t)}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-auto flex items-center justify-center gap-1 border-t pt-3 text-[11px] font-medium text-muted-foreground transition group-hover:text-primary">
        View analysis
        <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
      </div>
    </Card>
    </Link>
  )
}

function PriceCell({
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
    <div className="rounded-lg border bg-muted/20 px-1.5 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div
        className={cn(
          'mt-0.5 font-mono text-xs font-semibold sm:text-sm',
          accent && 'text-primary',
          tone === 'bad' && 'text-rose-400'
        )}
      >
        {value}
      </div>
    </div>
  )
}
