'use client'

import { useMemo, useState } from 'react'
import { fmtMoney, fmtSign, num, sameDay } from '@/lib/format'
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

  const { cells, monthPnl, tradeDays, winDays, lossDays, totalTrades } = useMemo(() => {
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
    let totalTrades = 0
    for (const d of days) {
      if (d.hasTrades) {
        tradeDays++
        totalTrades += d.trades
        monthPnl += d.pnl
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
    <div className="card-base p-3 sm:p-5">
      {/* Header: month nav + Today */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => goto(-1)}
            className="w-8 h-8 rounded-lg border border-strong/30 bg-bg3 hover:bg-card2 flex items-center justify-center transition shrink-0"
            aria-label="Previous month"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="text-[16px] sm:text-[18px] font-semibold min-w-[120px] sm:min-w-[140px] text-center">
            {monthLabel}
          </div>
          <button
            onClick={() => goto(1)}
            className="w-8 h-8 rounded-lg border border-strong/30 bg-bg3 hover:bg-card2 flex items-center justify-center transition shrink-0"
            aria-label="Next month"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <button
          onClick={goToday}
          className="px-3 sm:px-4 h-8 rounded-lg bg-card2 border border-strong/40 hover:bg-bg3 text-[12px] font-medium text-text transition shrink-0"
        >
          Today
        </button>
      </div>

      {/* Monthly PnL line */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] sm:text-[15px] text-muted2">Monthly PnL</span>
        <span
          className={`text-[16px] sm:text-[18px] tnum font-bold ${
            monthPnl > 0 ? 'text-gain' : monthPnl < 0 ? 'text-loss' : 'text-muted2'
          }`}
        >
          {fmtMoney(monthPnl)}
        </span>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-1.5">
        {WEEKDAYS.map((w, i) => (
          <div
            key={i}
            className="text-center text-[9px] sm:text-[11px] uppercase tracking-wide text-muted"
          >
            <span className="sm:hidden">{w[0]}</span>
            <span className="hidden sm:inline">{w}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {cells.map((c, i) => {
          if (!c)
            return <div key={i} className="aspect-square sm:aspect-[5/4]" />

          const cellDate = new Date(cursor.getFullYear(), cursor.getMonth(), c.day)
          const isToday = isThisMonth && sameDay(cellDate.getTime(), today.getTime())
          const isFuture = isThisMonth && cellDate.getTime() > today.getTime()

          const positive = c.pnl > 0
          const negative = c.pnl < 0
          const pctReturn = walletBalance > 0 ? (c.pnl / walletBalance) * 100 : null

          // Colored left bar + tinted bg for traded days
          let bg = 'rgba(255,255,255,0.02)'
          let leftBar = 'transparent'
          if (positive) {
            bg = 'rgba(14, 203, 129, 0.10)'
            leftBar = '#0ecb81'
          } else if (negative) {
            bg = 'rgba(246, 70, 93, 0.10)'
            leftBar = '#f6465d'
          }

          const amtClass = positive
            ? 'text-gain'
            : negative
            ? 'text-loss'
            : 'text-muted/60'

          return (
            <div
              key={i}
              className={`relative aspect-square sm:aspect-[5/4] rounded-md sm:rounded-lg overflow-hidden flex flex-col px-1.5 sm:px-2 py-1 sm:py-1.5 transition hover:brightness-125 ${
                isFuture ? 'opacity-45' : ''
              } ${isToday ? 'ring-1 ring-accent' : 'ring-1 ring-white/[0.04]'}`}
              style={{
                background: bg,
                borderLeft: `2px solid ${leftBar}`,
              }}
              title={
                c.hasTrades
                  ? `${monthLabel.split(' ')[0]} ${c.day} · ${fmtMoney(c.pnl)}${
                      pctReturn !== null ? ` (${fmtSign(pctReturn)}%)` : ''
                    } · ${c.trades} trade${c.trades !== 1 ? 's' : ''}`
                  : `${monthLabel.split(' ')[0]} ${c.day} · no trades`
              }
            >
              {/* Day number */}
              <span
                className={`text-[9px] sm:text-[11px] tnum leading-none ${
                  isToday ? 'text-accent font-bold' : 'text-muted2/80'
                }`}
              >
                {c.day}
              </span>

              {/* PnL value centered in remaining space */}
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center leading-tight">
                  <div
                    className={`text-[9px] sm:text-[12px] tnum font-bold ${amtClass} whitespace-nowrap`}
                  >
                    {c.hasTrades ? fmtMoney(c.pnl) : '$0'}
                  </div>
                  {c.hasTrades && pctReturn !== null && (
                    <div className={`hidden sm:block text-[9px] tnum ${amtClass} opacity-70`}>
                      {fmtSign(pctReturn, Math.abs(pctReturn) < 1 ? 2 : 1)}%
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary bar */}
      <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 pt-3 border-t border-soft/40">
        <Summary
          label="Win Rate"
          value={`${winRate.toFixed(0)}%`}
          cls="text-accent"
        />
        <Summary label="Trade Days" value={String(tradeDays)} sub={`${totalTrades} trades`} />
        <Summary
          label="Month ROE"
          value={walletBalance > 0 ? fmtSign((monthPnl / walletBalance) * 100) + '%' : '—'}
          cls={monthPnl > 0 ? 'text-gain' : monthPnl < 0 ? 'text-loss' : 'text-text'}
        />
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
      <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted2">{label}</div>
      <div className={`mt-0.5 sm:mt-1 text-[14px] sm:text-[16px] tnum font-semibold ${cls} leading-none`}>
        {value}
      </div>
      {sub && <div className="mt-0.5 sm:mt-1 text-[9px] tnum text-muted hidden sm:block">{sub}</div>}
    </div>
  )
}
