'use client'

import { useMemo, useState } from 'react'
import FundingLineChart from '@/components/charts/FundingLineChart'
import IncomeDonutChart from '@/components/charts/IncomeDonutChart'
import { fmtSign, fmtTime, num } from '@/lib/format'
import type { IncomeRecord } from '@/types/binance'

type Filter = 'ALL' | 'REALIZED_PNL' | 'FUNDING_FEE' | 'COMMISSION' | 'TRANSFER'

interface Props {
  allIncome: IncomeRecord[]
  fundingIncome: IncomeRecord[]
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'REALIZED_PNL', label: 'Realized PnL' },
  { key: 'FUNDING_FEE', label: 'Funding Fee' },
  { key: 'COMMISSION', label: 'Commission' },
  { key: 'TRANSFER', label: 'Transfer' },
]

const TYPE_STYLE: Record<string, string> = {
  REALIZED_PNL: 'bg-gain/15 text-gain border-gain/30',
  FUNDING_FEE: 'bg-warn/15 text-warn border-warn/30',
  COMMISSION: 'bg-loss/15 text-loss border-loss/30',
  TRANSFER: 'bg-info/15 text-info border-info/30',
}

export default function IncomeTab({ allIncome, fundingIncome }: Props) {
  const [filter, setFilter] = useState<Filter>('ALL')

  const filtered = useMemo(() => {
    const rows = filter === 'ALL' ? allIncome : allIncome.filter((r) => r.incomeType === filter)
    return [...rows].sort((a, b) => b.time - a.time).slice(0, 200)
  }, [allIncome, filter])

  return (
    <div className="space-y-5">
      <div className="card-base p-5">
        <div className="flex flex-wrap gap-1.5 mb-4">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-[11.5px] tracking-wide transition border ${
                filter === f.key
                  ? 'bg-accent/15 border-accent/50 text-accent'
                  : 'bg-bg3 border-soft/40 text-muted2 hover:text-text'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="bg-bg3 text-muted2 text-[10.5px] uppercase tracking-wider">
                <th className="px-3 py-2.5 text-left font-medium">Time</th>
                <th className="px-3 py-2.5 text-left font-medium">Type</th>
                <th className="px-3 py-2.5 text-left font-medium">Symbol</th>
                <th className="px-3 py-2.5 text-right font-medium">Amount</th>
                <th className="px-3 py-2.5 text-left font-medium">Asset</th>
                <th className="px-3 py-2.5 text-left font-medium">Info</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-muted">
                    No records.
                  </td>
                </tr>
              ) : (
                filtered.map((r, i) => {
                  const amt = num(r.income)
                  const tone =
                    TYPE_STYLE[r.incomeType] ||
                    'bg-bg3 text-muted2 border-soft/40'
                  return (
                    <tr
                      key={r.tranId + '-' + i}
                      className="border-t border-soft/30 hover:bg-card2 transition-colors"
                    >
                      <td className="px-3 py-2.5 text-muted2 tnum whitespace-nowrap">
                        {fmtTime(r.time)}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10.5px] font-semibold ${tone}`}
                        >
                          {r.incomeType.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-medium">{r.symbol || '—'}</td>
                      <td
                        className={`px-3 py-2.5 text-right tnum font-semibold ${
                          amt >= 0 ? 'text-gain' : 'text-loss'
                        }`}
                      >
                        {fmtSign(amt, 6)}
                      </td>
                      <td className="px-3 py-2.5 text-muted2">{r.asset}</td>
                      <td className="px-3 py-2.5 text-muted truncate max-w-[260px]">
                        {r.info || '—'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <FundingLineChart records={fundingIncome} />
        <IncomeDonutChart records={allIncome} />
      </div>
    </div>
  )
}
