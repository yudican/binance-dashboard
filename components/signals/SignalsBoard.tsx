'use client'

import { useMemo, useState } from 'react'
import SignalCard from '@/components/signals/SignalCard'
import { cn } from '@/lib/utils'
import type { Signal } from '@/lib/signals'

type Filter = 'all' | 'active' | 'long' | 'short' | 'watch' | 'closed'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'long', label: 'Long' },
  { key: 'short', label: 'Short' },
  { key: 'watch', label: 'Watch' },
  { key: 'closed', label: 'Closed' },
]

function applyFilter(signals: Signal[], filter: Filter) {
  switch (filter) {
    case 'active':
      return signals.filter((s) => s.status === 'active')
    case 'closed':
      return signals.filter((s) => s.status === 'closed')
    case 'long':
      return signals.filter((s) => s.side === 'LONG')
    case 'short':
      return signals.filter((s) => s.side === 'SHORT')
    case 'watch':
      return signals.filter((s) => s.side === 'WATCH')
    default:
      return signals
  }
}

export default function SignalsBoard({ signals }: { signals: Signal[] }) {
  const [filter, setFilter] = useState<Filter>('all')
  const list = useMemo(() => applyFilter(signals, filter), [signals, filter])

  return (
    <>
      {/* filters */}
      <div className="tab-scroll -mx-1 overflow-x-auto px-1">
        <div className="inline-flex gap-1.5 rounded-xl border bg-card/60 p-1 backdrop-blur">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium transition',
                filter === f.key
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* signal grid */}
      {list.length ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {list.map((s) => (
            <SignalCard key={s.id} signal={s} />
          ))}
        </section>
      ) : (
        <div className="grid place-items-center rounded-xl border bg-muted/20 py-20 text-sm text-muted-foreground">
          No {filter} signals right now.
        </div>
      )}
    </>
  )
}
