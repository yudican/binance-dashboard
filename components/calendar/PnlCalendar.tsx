'use client'

import { useMemo } from 'react'
import { addDays, format, startOfMonth, startOfWeek } from 'date-fns'
import { money } from '@/lib/utils'

interface Props {
  month: Date
  daily: { date: string; pnl: number }[]
}

export default function PnlCalendar({ month, daily }: Props) {
  const values = useMemo(() => new Map(daily.map((d) => [d.date, d.pnl])), [daily])
  const start = startOfWeek(startOfMonth(month))
  const days = Array.from({ length: 42 }, (_, i) => addDays(start, i))
  return (
    <div>
      <div className="mb-3 text-sm font-semibold">{format(month, 'MMMM yyyy')}</div>
      <div className="grid grid-cols-7 overflow-hidden rounded-xl border text-xs">
        <div className="col-span-7 grid grid-cols-7 bg-muted/40 text-muted-foreground">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="p-2 text-center">{d}</div>
          ))}
        </div>
        {days.map((day) => {
          const iso = format(day, 'yyyy-MM-dd')
          const pnl = values.get(iso) || 0
          const inMonth = day.getMonth() === month.getMonth()
          return (
            <div
              key={iso}
              className={`min-h-12 border-t p-2 sm:min-h-14 lg:min-h-16 ${inMonth ? '' : 'opacity-35'} ${
                pnl > 0 ? 'bg-emerald-500/10' : pnl < 0 ? 'bg-rose-500/10' : ''
              }`}
            >
              <div className="text-right text-muted-foreground">{format(day, 'd')}</div>
              {pnl !== 0 && (
                <div className={pnl > 0 ? 'text-emerald-400' : 'text-rose-400'}>{money(pnl)}</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
