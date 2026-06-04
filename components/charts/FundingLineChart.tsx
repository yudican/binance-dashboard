'use client'

import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { fmtSign, num, daysAgo, fmtDate } from '@/lib/format'
import type { IncomeRecord } from '@/types/binance'

interface Props {
  records: IncomeRecord[]
  className?: string
}

export default function FundingLineChart({ records, className }: Props) {
  const { data, total } = useMemo(() => {
    const cutoff = daysAgo(30)
    const filtered = (records || [])
      .filter((r) => r.incomeType === 'FUNDING_FEE' && r.time >= cutoff)
      .sort((a, b) => a.time - b.time)

    const byDay = new Map<string, number>()
    for (const r of filtered) {
      const d = new Date(r.time)
      d.setHours(0, 0, 0, 0)
      byDay.set(String(d.getTime()), (byDay.get(String(d.getTime())) || 0) + num(r.income))
    }

    const days = 30
    const out: { t: number; cum: number; label: string }[] = []
    let cum = 0
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    start.setDate(start.getDate() - (days - 1))
    for (let i = 0; i < days; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      const t = d.getTime()
      cum += byDay.get(String(t)) || 0
      out.push({ t, cum, label: fmtDate(t) })
    }
    return { data: out, total: cum }
  }, [records])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Cumulative Funding (30D)</CardTitle>
        <CardDescription className={total >= 0 ? 'text-emerald-400' : 'text-amber-400'}>
          {fmtSign(total)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="fundFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,.07)" vertical={false} />
              <XAxis dataKey="label" stroke="#73737f" fontSize={10} tickLine={false} axisLine={false} minTickGap={28} />
              <YAxis width={42} stroke="#73737f" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => fmtSign(v, 0)} />
              <Tooltip
                contentStyle={{ background: '#141418', border: '1px solid #2d2d33', borderRadius: 12 }}
                formatter={(v: any) => [fmtSign(v), 'Cumulative']}
              />
              <Area type="monotone" dataKey="cum" stroke="#f59e0b" strokeWidth={2} fill="url(#fundFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
