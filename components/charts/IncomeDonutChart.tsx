'use client'

import { useMemo } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { fmt, num } from '@/lib/format'
import type { IncomeRecord } from '@/types/binance'

interface Props {
  records: IncomeRecord[]
}

export default function IncomeDonutChart({ records }: Props) {
  const segments = useMemo(() => {
    let pnl = 0
    let funding = 0
    let commission = 0
    for (const r of records) {
      const v = Math.abs(num(r.income))
      if (r.incomeType === 'REALIZED_PNL') pnl += v
      else if (r.incomeType === 'FUNDING_FEE') funding += v
      else if (r.incomeType === 'COMMISSION') commission += v
    }
    return [
      { name: 'PnL', value: pnl, color: '#0ecb81' },
      { name: 'Funding', value: funding, color: '#f77f00' },
      { name: 'Commission', value: commission, color: '#f6465d' },
    ]
  }, [records])

  const total = segments.reduce((a, b) => a + b.value, 0)
  const hasData = total > 0

  return (
    <div className="card-base p-5">
      <div className="text-[11px] uppercase tracking-[0.14em] text-muted2">
        Income Breakdown
      </div>
      <div className="grid grid-cols-[1fr_1fr] gap-4 mt-2 items-center">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(v: any, name: any) => [fmt(v as number), name as string]}
              />
              <Pie
                data={hasData ? segments : [{ name: 'No data', value: 1, color: '#1a2030' }]}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                stroke="none"
              >
                {(hasData ? segments : [{ color: '#1a2030' }]).map((s, i) => (
                  <Cell key={i} fill={s.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2.5">
          {segments.map((s) => {
            const pct = hasData ? (s.value / total) * 100 : 0
            return (
              <div key={s.name} className="flex items-center gap-2.5">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-sm"
                  style={{ background: s.color }}
                />
                <div className="flex-1">
                  <div className="text-[11px] text-muted2 uppercase tracking-wide">
                    {s.name}
                  </div>
                  <div className="text-[13px] tnum">
                    {fmt(s.value)}{' '}
                    <span className="text-muted text-[11px]">
                      ({fmt(pct, 1)}%)
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
