'use client'

import { useMemo, useState } from 'react'
import { fmtCompact, fmtSign, num, sameDay } from '@/lib/format'
import type { IncomeRecord } from '@/types/binance'

interface Props {
  records: IncomeRecord[]
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function PnlCalendar({ records }: Props) {
  const [cursor, setCursor] = useState<Date>(() => startOfMonth(new Date()))

  const { cells, monthPnl, tradeDays, winDays, lossDays } = useMemo(() => {
    const first = startOfMonth(cursor)
    const total = daysInMonth(cursor)
    const monthMap = new Map<number, number>()

    for (const r of records) {
      if (r.incomeType !== 'REALIZED_PNL') continue
      const d = new Date(r.time)
      if (d.getFullYear() !== first.getFullYear() || d.getMonth() !== first.getMonth())
        continue
      const day = d.getDate()
      monthMap.set(day, (monthMap.get(day) || 0) + num(r.income))
    }

    const firstWeekday = first.getDay()
    const blanks = Array.from({ length: firstWeekday }).map(() => null)
    const days = Array.from({ length: total }).map((_, i) => {
      const day = i + 1
      const pnl = monthMap.get(day) || 0
      return { day, pnl, hasTrades: monthMap.has(day) }
    })

    let monthPnl = 0
    let tradeDays = 0
    let winDays = 0
    let lossDays = 0
    for (const d of days) {
      if (d.hasTrades) {
        tradeDays++
        monthPnl += d.pnl
        if (d.pnl > 0) winDays++
        else if (d.pnl < 0) lossDays++
      }
    }

    return {
      cells: [...blanks, ...days] as Array<null | { day: number; pnl: number; hasTrades: boolean }>,
      monthPnl,
      tradeDays,
      winDays,
      lossDays,
    }
  }, [cursor, records])

  const monthLabel = cursor.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const today = new Date()
  const isThisMonth =
    cursor.getFullYear() === today.getFullYear() &&
    cursor.getMonth() === today.getMonth()

  const goto = (delta: number) => {
    const next = new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1)
    setCursor(next)
  }

  return (
    <div className="card-base p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-muted2">
            PnL Calendar
          </div>
          <div className="text-[18px] font-semibold mt-0.5">{monthLabel}</div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => goto(-1)}
            className="w-8 h-8 rounded-lg border border-strong/30 bg-bg3 hover:bg-card2 flex items-center justify-center transition"
            aria-label="Previous month"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={() => goto(1)}
            className="w-8 h-8 rounded-lg border border-strong/30 bg-bg3 hover:bg-card2 flex items-center justify-center transition"
            aria-label="Next month"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-2">
        {WEEKDAYS.map((w, i) => (
          <div
            key={i}
            className="text-center text-[10px] uppercase tracking-wider text-muted"
          >
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((c, i) => {
          if (!c) return <div key={i} className="h-[64px]" />
          const cellDate = new Date(cursor.getFullYear(), cursor.getMonth(), c.day)
          const isToday = isThisMonth && sameDay(cellDate.getTime(), today.getTime())
          const bg = !c.hasTrades
            ? 'bg-bg3'
            : c.pnl > 0
            ? 'bg-gain/12'
            : c.pnl < 0
            ? 'bg-loss/12'
            : 'bg-bg3'
          const border = isToday
            ? 'border-accent/80'
            : c.pnl > 0
            ? 'border-gain/30'
            : c.pnl < 0
            ? 'border-loss/30'
            : 'border-soft/30'
          const pnlClass = c.pnl > 0 ? 'text-gain' : c.pnl < 0 ? 'text-loss' : 'text-muted'

          return (
            <div
              key={i}
              className={`h-[64px] rounded-lg border ${border} ${bg} px-2 py-1.5 flex flex-col justify-between transition hover:brightness-110`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] tnum ${
                    isToday ? 'text-accent font-semibold' : 'text-muted2'
                  }`}
                >
                  {c.day}
                </span>
              </div>
              {c.hasTrades && (
                <div className={`text-[11px] tnum font-semibold ${pnlClass} truncate`}>
                  {fmtCompact(c.pnl)}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-soft/40">
        <Summary
          label="Month PnL"
          value={fmtSign(monthPnl)}
          cls={monthPnl > 0 ? 'text-gain' : monthPnl < 0 ? 'text-loss' : 'text-text'}
        />
        <Summary label="Trade Days" value={String(tradeDays)} />
        <Summary label="Win Days" value={String(winDays)} cls="text-gain" />
        <Summary label="Loss Days" value={String(lossDays)} cls="text-loss" />
      </div>
    </div>
  )
}

function Summary({ label, value, cls = 'text-text' }: { label: string; value: string; cls?: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted2">{label}</div>
      <div className={`mt-1 text-[15px] tnum font-semibold ${cls}`}>{value}</div>
    </div>
  )
}
