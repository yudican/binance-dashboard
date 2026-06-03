'use client'

import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { fmtSign, num, daysAgo, fmtDate } from '@/lib/format'
import type { IncomeRecord } from '@/types/binance'

type Period = '7d' | '30d' | '90d'

interface Props {
  records: IncomeRecord[]
}

const PERIOD_DAYS: Record<Period, number> = { '7d': 7, '30d': 30, '90d': 90 }

export default function PnlLineChart({ records }: Props) {
  const [period, setPeriod] = useState<Period>('30d')

  const { data, total } = useMemo(() => {
    const cutoff = daysAgo(PERIOD_DAYS[period])
    const filtered = (records || [])
      .filter((r) => r.time >= cutoff && r.incomeType === 'REALIZED_PNL')
      .sort((a, b) => a.time - b.time)

    // bucket by day
    const byDay = new Map<string, number>()
    for (const r of filtered) {
      const d = new Date(r.time)
      d.setHours(0, 0, 0, 0)
      const k = String(d.getTime())
      byDay.set(k, (byDay.get(k) || 0) + num(r.income))
    }

    const days = PERIOD_DAYS[period]
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
  }, [records, period])

  const positive = total >= 0
  const stroke = positive ? '#0ecb81' : '#f6465d'
  const fillId = positive ? 'pnlPos' : 'pnlNeg'

  return (
    <div className="card-base p-5">
      <div className="flex items-center justify-between mb-1">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-muted2">Cumulative PnL</div>
          <div className={`mt-0.5 text-[22px] tnum font-semibold ${positive ? 'text-gain' : 'text-loss'}`}>
            {fmtSign(total)}
          </div>
        </div>
        <div className="flex rounded-lg bg-bg3 p-0.5 border border-soft/40">
          {(['7d', '30d', '90d'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2.5 py-1 text-[11px] uppercase tracking-wide rounded-md transition ${
                period === p ? 'bg-card2 text-accent' : 'text-muted2 hover:text-text'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[240px] mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="pnlPos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ecb81" stopOpacity={0.32} />
                <stop offset="100%" stopColor="#0ecb81" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="pnlNeg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f6465d" stopOpacity={0.32} />
                <stop offset="100%" stopColor="#f6465d" stopOpacity={0} />
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
              labelStyle={{ color: '#9ca3af' }}
            />
            <Area
              type="monotone"
              dataKey="cum"
              stroke={stroke}
              strokeWidth={2}
              fill={`url(#${fillId})`}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
