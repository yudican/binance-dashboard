'use client'

import { useMemo } from 'react'
import { Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useMarkPrices } from '@/hooks/useMarkPrices'
import { useSignalProgressSync } from '@/hooks/useSignalProgressSync'
import { liveStatus, normalizePair, type Signal } from '@/lib/signals'
import { cn } from '@/lib/utils'

function fmtPrice(n: number) {
  const abs = Math.abs(n)
  const dec = abs >= 100 ? 2 : abs >= 1 ? 3 : 4
  return n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })
}

export default function SignalLive({ signal }: { signal: Signal }) {
  const pairs = useMemo(() => [signal.pair], [signal.pair])
  const marks = useMarkPrices(pairs)
  const signalsList = useMemo(() => [signal], [signal])
  useSignalProgressSync(signalsList, marks)
  const price = marks[normalizePair(signal.pair)]
  const live = liveStatus(signal, price)
  const isWatch = signal.side === 'WATCH'
  const pnlPos = (live?.pnlPercent ?? 0) >= 0

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Trade Levels</CardTitle>
        <div className="flex items-center gap-2">
          {price !== undefined && (
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          )}
          <span className="text-[11px] text-muted-foreground">
            {price !== undefined ? 'Live' : 'Connecting…'}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <Level label="Entry" value={fmtPrice(signal.entry)} />
          <Level
            label="Live"
            value={price !== undefined ? fmtPrice(price) : '—'}
            tone={price === undefined ? undefined : pnlPos ? 'good' : 'bad'}
          />
          <Level label="Stop" value={fmtPrice(signal.stopLoss)} tone="bad" />
        </div>

        {!isWatch && (
          <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2">
            <span className="text-[11px] text-muted-foreground">Live PnL (return on margin off)</span>
            <span
              className={cn(
                'font-mono text-lg font-black',
                live === null ? 'text-muted-foreground' : pnlPos ? 'text-emerald-400' : 'text-rose-400'
              )}
            >
              {live === null ? '—' : `${pnlPos ? '+' : ''}${live.pnlPercent.toFixed(2)}%`}
            </span>
          </div>
        )}

        {live?.stopHit && (
          <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-300">
            Stop loss tersentuh — idea invalidated.
          </div>
        )}

        <div>
          <div className="mb-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Target className="h-3.5 w-3.5" />
            {!isWatch
              ? `Targets · ${Math.max(signal.targetsHit, live?.tpHitCount ?? 0)}/${signal.targets.length} hit`
              : 'Targets'}
          </div>
          <div className="space-y-2">
            {signal.targets.map((t, i) => {
              const hit = i < signal.targetsHit || !!live?.tpHit[i]
              return (
                <div
                  key={i}
                  className={cn(
                    'flex items-center justify-between rounded-lg border px-3 py-2 text-sm',
                    hit ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-border bg-muted/20'
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
  )
}

function Level({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'bad' }) {
  return (
    <div className="rounded-lg border bg-muted/20 px-2 py-3">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div
        className={cn(
          'mt-1 font-mono text-sm font-bold',
          tone === 'good' && 'text-emerald-400',
          tone === 'bad' && 'text-rose-400'
        )}
      >
        {value}
      </div>
    </div>
  )
}
