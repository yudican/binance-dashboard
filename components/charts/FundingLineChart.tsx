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
import { fmtSign, num, daysAgo, fmtDate } from '@/lib/format'
import type { IncomeRecord } from '@/types/binance'

interface Props {
  records: IncomeRecord[]
}

export default function FundingLineChart({ records }: Props) {
  const { data, total } = useMemo(() => {
    const cutoff = daysAgo(30)
    const filtered = (records || [])
      .filter((r) => r.incomeType === 'FUNDING_FEE' && r.time >= cutoff)
      .sort((a, b) => a.time - b.time)

    const byDay = new Map<string, number>()
    for (const r of filtered) {
      const d = new Date(r.time)
      d.setHours(0, 0, 0, 0)
      const k = String(d.getTime())
      byDay.set(k, (byDay.get(k) || 0) + num(r.income))
    }

    const days = 30
    const out: { t: number; cum: number; day: number; label: string }[] = []
    let cum = 0
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    start.setDate(start.getDate() - (days - 1))
    for (let i = 0; i < days; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      const t = d.getTime()
      const day = byDay.get(String(t)) || 0
      cum += day
      out.push({ t, cum, day, label: fmtDate(t) })
    }
    return { data: out, total: cum }
  }, [records])

  return (
    <div className="card-base p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-muted2">
            Cumulative Funding (30D)
          </div>
          <div
            className={`mt-0.5 text-[20px] tnum font-semibold ${
              total >= 0 ? 'text-gain' : 'text-warn'
            }`}
          >
            {fmtSign(total)}
          </div>
        </div>
      </div>

      <div className="h-[220px] mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="fundFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f77f00" stopOpacity={0.32} />
                <stop offset="100%" stopColor="#f77f00" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#6b7280"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              minTickGap={28}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              width={60}
              tickFormatter={(v) => fmtSign(v, 0)}
            />
            <Tooltip
              cursor={{ stroke: 'rgba(255,255,255,0.12)' }}
              formatter={(v: any) => [fmtSign(v), 'Cumulative']}
            />
            <Area
              type="monotone"
              dataKey="cum"
              stroke="#f77f00"
              strokeWidth={2}
              fill="url(#fundFill)"
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
