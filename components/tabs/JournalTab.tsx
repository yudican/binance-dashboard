'use client'

import { useMemo } from 'react'
import { daysAgo, fmtSign, fmtTime, num, startOfDay } from '@/lib/format'
import type { IncomeRecord } from '@/types/binance'

export type JournalPeriod = 'today' | '7d' | '30d'

interface Props {
  pnlIncome: IncomeRecord[]
  period: JournalPeriod
  setPeriod: (p: JournalPeriod) => void
}

const OPTIONS: { key: JournalPeriod; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7D' },
  { key: '30d', label: '30D' },
]

export default function JournalTab({ pnlIncome, period, setPeriod }: Props) {
  const rows = useMemo(() => {
    const cutoff =
      period === 'today' ? startOfDay(Date.now()) : period === '7d' ? daysAgo(7) : daysAgo(30)
    return pnlIncome
      .filter((r) => r.time >= cutoff && r.incomeType === 'REALIZED_PNL')
      .sort((a, b) => b.time - a.time)
  }, [pnlIncome, period])

  const total = rows.reduce((a, r) => a + num(r.income), 0)
  const wins = rows.filter((r) => num(r.income) > 0).length
  const losses = rows.filter((r) => num(r.income) < 0).length

  return (
    <div className="space-y-5">
      <div className="card-base p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex gap-1.5">
            {OPTIONS.map((o) => (
              <button
                key={o.key}
                onClick={() => setPeriod(o.key)}
                className={`px-3 py-1.5 rounded-lg text-[11.5px] tracking-wide transition border ${
                  period === o.key
                    ? 'bg-accent/15 border-accent/50 text-accent'
                    : 'bg-bg3 border-soft/40 text-muted2 hover:text-text'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 text-[12px]">
            <Stat label="Trades" value={String(rows.length)} />
            <Stat label="Wins" value={String(wins)} cls="text-gain" />
            <Stat label="Losses" value={String(losses)} cls="text-loss" />
            <Stat
              label="Net"
              value={fmtSign(total)}
              cls={total >= 0 ? 'text-gain' : 'text-loss'}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="bg-bg3 text-muted2 text-[10.5px] uppercase tracking-wider">
                <th className="px-3 py-2.5 text-left font-medium">Time</th>
                <th className="px-3 py-2.5 text-left font-medium">Symbol</th>
                <th className="px-3 py-2.5 text-right font-medium">Realized PnL</th>
                <th className="px-3 py-2.5 text-left font-medium">Type</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-muted">
                    No realized trades in this period.
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => {
                  const amt = num(r.income)
                  return (
                    <tr
                      key={(r.tradeId || r.tranId || '') + '-' + i}
                      className="border-t border-soft/30 hover:bg-card2 transition-colors"
                    >
                      <td className="px-3 py-2.5 text-muted2 tnum whitespace-nowrap">
                        {fmtTime(r.time)}
                      </td>
                      <td className="px-3 py-2.5 font-medium">{r.symbol || '—'}</td>
                      <td
                        className={`px-3 py-2.5 text-right tnum font-semibold ${
                          amt >= 0 ? 'text-gain' : 'text-loss'
                        }`}
                      >
                        {fmtSign(amt, 4)}
                      </td>
                      <td className="px-3 py-2.5 text-muted2">REALIZED_PNL</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  cls = 'text-text',
}: {
  label: string
  value: string
  cls?: string
}) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-[10px] uppercase tracking-wider text-muted2">{label}</span>
      <span className={`tnum font-semibold ${cls}`}>{value}</span>
    </div>
  )
}
