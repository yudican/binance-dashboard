'use client'

import { useMemo, useState } from 'react'
import { fmtCompact, fmtSign, num, sameDay } from '@/lib/format'
import type { IncomeRecord } from '@/types/binance'

interface Props {
  records: IncomeRecord[]
  /** Used to express each day's PnL as a % return on equity. */
  walletBalance?: number
}

interface DayCell {
  day: number
  pnl: number
  trades: number
  hasTrades: boolean
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function PnlCalendar({ records, walletBalance = 0 }: Props) {
  const [cursor, setCursor] = useState<Date>(() => startOfMonth(new Date()))

  const { cells, monthPnl, tradeDays, winDays, lossDays, maxAbs, totalTrades } = useMemo(() => {
    const first = startOfMonth(cursor)
    const total = daysInMonth(cursor)
    const pnlMap = new Map<number, number>()
    const cntMap = new Map<number, number>()

    for (const r of records) {
      if (r.incomeType !== 'REALIZED_PNL') continue
      const d = new Date(r.time)
      if (d.getFullYear() !== first.getFullYear() || d.getMonth() !== first.getMonth())
        continue
      const day = d.getDate()
      pnlMap.set(day, (pnlMap.get(day) || 0) + num(r.income))
      cntMap.set(day, (cntMap.get(day) || 0) + 1)
    }

    const firstWeekday = first.getDay()
    const blanks = Array.from({ length: firstWeekday }).map(() => null)
    const days: DayCell[] = Array.from({ length: total }).map((_, i) => {
      const day = i + 1
      return {
        day,
        pnl: pnlMap.get(day) || 0,
        trades: cntMap.get(day) || 0,
        hasTrades: pnlMap.has(day),
      }
    })

    let monthPnl = 0
    let tradeDays = 0
    let winDays = 0
    let lossDays = 0
    let maxAbs = 0
    let totalTrades = 0
    for (const d of days) {
      if (d.hasTrades) {
        tradeDays++
        totalTrades += d.trades
        monthPnl += d.pnl
        maxAbs = Math.max(maxAbs, Math.abs(d.pnl))
        if (d.pnl > 0) winDays++
        else if (d.pnl < 0) lossDays++
      }
    }

    return {
      cells: [...blanks, ...days] as Array<null | DayCell>,
      monthPnl,
      tradeDays,
      winDays,
      lossDays,
      maxAbs,
      totalTrades,
    }
  }, [cursor, records])

  const monthLabel = cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const today = new Date()
  const isThisMonth =
    cursor.getFullYear() === today.getFullYear() && cursor.getMonth() === today.getMonth()

  const goto = (delta: number) =>
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1))
  const goToday = () => setCursor(startOfMonth(new Date()))

  const winRate = winDays + lossDays > 0 ? (winDays / (winDays + lossDays)) * 100 : 0

  return (
    <div className="card-base p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-muted2">
              PnL Calendar
            </div>
            <div className="text-[20px] font-semibold mt-0.5 leading-none">{monthLabel}</div>
          </div>
          <span
            className={`text-[13px] tnum font-semibold px-2 py-1 rounded-md ${
              monthPnl > 0
                ? 'text-gain bg-gain/10'
                : monthPnl < 0
                ? 'text-loss bg-loss/10'
                : 'text-muted2 bg-bg3'
            }`}
          >
            {fmtSign(monthPnl)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={goToday}
            className="px-2.5 h-8 rounded-lg border border-strong/30 bg-bg3 hover:bg-card2 text-[11px] uppercase tracking-wider text-muted2 hover:text-text transition"
          >
            Today
          </button>
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

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {WEEKDAYS.map((w, i) => (
          <div
            key={i}
            className={`text-center text-[10px] uppercase tracking-wider ${
              i === 0 || i === 6 ? 'text-muted/70' : 'text-muted'
            }`}
          >
            {w}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-2">
        {cells.map((c, i) => {
          if (!c) return <div key={i} className="aspect-square sm:aspect-auto sm:h-[88px]" />

          const cellDate = new Date(cursor.getFullYear(), cursor.getMonth(), c.day)
          const isToday = isThisMonth && sameDay(cellDate.getTime(), today.getTime())
          const isFuture = cellDate.getTime() > today.getTime() && isThisMonth

          // Heatmap intensity: scale 0.14 → 0.55 by magnitude vs month max
          const intensity = maxAbs > 0 ? Math.abs(c.pnl) / maxAbs : 0
          const alpha = c.hasTrades ? 0.16 + intensity * 0.42 : 0
          const positive = c.pnl > 0
          const negative = c.pnl < 0

          const baseColor = positive ? '14, 203, 129' : negative ? '246, 70, 93' : '255,255,255'
          const pctReturn = walletBalance > 0 ? (c.pnl / walletBalance) * 100 : null

          const ringColor = isToday
            ? 'ring-2 ring-accent'
            : positive
            ? 'ring-1 ring-gain/25'
            : negative
            ? 'ring-1 ring-loss/25'
            : 'ring-1 ring-white/[0.05]'

          const pnlClass = positive ? 'text-gain' : negative ? 'text-loss' : 'text-muted'

          return (
            <div
              key={i}
              className={`relative aspect-square sm:aspect-auto sm:h-[88px] rounded-xl ${ringColor} px-2 py-1.5 flex flex-col justify-between overflow-hidden transition-transform duration-150 hover:scale-[1.04] hover:z-10 ${
                c.hasTrades ? 'cursor-default' : ''
              } ${isFuture ? 'opacity-40' : ''}`}
              style={{
                background: c.hasTrades
                  ? `linear-gradient(155deg, rgba(${baseColor}, ${alpha}) 0%, rgba(${baseColor}, ${alpha * 0.35}) 100%)`
                  : 'rgba(255,255,255,0.018)',
              }}
              title={
                c.hasTrades
                  ? `${monthLabel.split(' ')[0]} ${c.day} · ${fmtSign(c.pnl)}${
                      pctReturn !== null ? ` (${fmtSign(pctReturn)}%)` : ''
                    } · ${c.trades} trade${c.trades !== 1 ? 's' : ''}`
                  : undefined
              }
            >
              {/* Day number + trade count */}
              <div className="flex items-start justify-between">
                <span
                  className={`text-[12px] tnum leading-none ${
                    isToday
                      ? 'text-accent font-bold'
                      : c.hasTrades
                      ? 'text-text/90 font-medium'
                      : 'text-muted2/70'
                  }`}
                >
                  {c.day}
                </span>
                {c.hasTrades && (
                  <span className="text-[9px] tnum text-muted2/70 leading-none mt-0.5">
                    {c.trades}×
                  </span>
                )}
              </div>

              {/* PnL value + percentage */}
              {c.hasTrades && (
                <div className="leading-tight">
                  <div className={`text-[12px] sm:text-[13px] tnum font-bold ${pnlClass} truncate`}>
                    {fmtCompact(c.pnl)}
                  </div>
                  {pctReturn !== null && (
                    <div className={`text-[9.5px] tnum font-medium ${pnlClass} opacity-80`}>
                      {fmtSign(pctReturn, Math.abs(pctReturn) < 1 ? 2 : 1)}%
                    </div>
                  )}
                </div>
              )}

              {/* Today dot */}
              {isToday && (
                <span className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent animate-pulseDot" />
              )}
            </div>
          )
        })}
      </div>

      {/* Summary bar */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-soft/40">
        <Summary
          label="Month PnL"
          value={fmtSign(monthPnl)}
          sub={walletBalance > 0 ? `${fmtSign((monthPnl / walletBalance) * 100)}% ROE` : undefined}
          cls={monthPnl > 0 ? 'text-gain' : monthPnl < 0 ? 'text-loss' : 'text-text'}
        />
        <Summary label="Win Rate" value={`${winRate.toFixed(0)}%`} cls="text-accent" />
        <Summary label="Trade Days" value={String(tradeDays)} sub={`${totalTrades} trades`} />
        <Summary label="Win Days" value={String(winDays)} cls="text-gain" />
        <Summary label="Loss Days" value={String(lossDays)} cls="text-loss" />
      </div>
    </div>
  )
}

function Summary({
  label,
  value,
  sub,
  cls = 'text-text',
}: {
  label: string
  value: string
  sub?: string
  cls?: string
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted2">{label}</div>
      <div className={`mt-1 text-[16px] tnum font-semibold ${cls} leading-none`}>{value}</div>
      {sub && <div className="mt-1 text-[10px] tnum text-muted">{sub}</div>}
    </div>
  )
}
