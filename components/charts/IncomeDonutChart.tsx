'use client'

import { useMemo } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { fmt, num } from '@/lib/format'
import type { IncomeRecord } from '@/types/binance'

interface Props {
  records: IncomeRecord[]
  className?: string
}

export default function IncomeDonutChart({ records, className }: Props) {
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
      { name: 'PnL', value: pnl, color: '#34d399' },
      { name: 'Funding', value: funding, color: '#f59e0b' },
      { name: 'Commission', value: commission, color: '#f43f5e' },
    ]
  }, [records])

  const total = segments.reduce((a, b) => a + b.value, 0)
  const hasData = total > 0

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Income Breakdown</CardTitle>
        <CardDescription>Absolute magnitude by type</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[1fr_1fr] items-center gap-4">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  contentStyle={{ background: '#141418', border: '1px solid #2d2d33', borderRadius: 12 }}
                  formatter={(v: any, name: any) => [fmt(v as number), name as string]}
                />
                <Pie
                  data={hasData ? segments : [{ name: 'No data', value: 1, color: '#1f1f24' }]}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  stroke="none"
                >
                  {(hasData ? segments : [{ color: '#1f1f24' }]).map((seg, i) => (
                    <Cell key={i} fill={seg.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2.5">
            {segments.map((seg) => {
              const pct = hasData ? (seg.value / total) * 100 : 0
              return (
                <div key={seg.name} className="flex items-center gap-2.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: seg.color }} />
                  <div className="flex-1">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{seg.name}</div>
                    <div className="text-[13px] tnum">
                      {fmt(seg.value)} <span className="text-[11px] text-muted-foreground">({fmt(pct, 1)}%)</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
