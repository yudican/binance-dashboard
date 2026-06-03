'use client'

import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { fmt, fmtSign, num } from '@/lib/format'
import type { IncomeRecord } from '@/types/binance'

interface Props {
  records: IncomeRecord[]
}

export default function DistributionBarChart({ records }: Props) {
  const stats = useMemo(() => {
    let wins = 0
    let losses = 0
    let winSum = 0
    let lossSum = 0
    for (const r of records) {
      if (r.incomeType !== 'REALIZED_PNL') continue
      const v = num(r.income)
      if (v > 0) {
        wins++
        winSum += v
      } else if (v < 0) {
        losses++
        lossSum += v
      }
    }
    const total = wins + losses
    const winRate = total ? (wins / total) * 100 : 0
    const avgWin = wins ? winSum / wins : 0
    const avgLoss = losses ? lossSum / losses : 0
    return { wins, losses, total, winRate, avgWin, avgLoss }
  }, [records])

  const data = [
    { name: 'Wins', value: stats.wins, color: '#0ecb81' },
    { name: 'Losses', value: stats.losses, color: '#f6465d' },
  ]

  return (
    <div className="card-base p-5">
      <div className="text-[11px] uppercase tracking-[0.14em] text-muted2">
        Trade Distribution
      </div>

      <div className="mt-3 grid grid-cols-4 gap-3">
        <Mini label="Win Rate" value={`${fmt(stats.winRate, 1)}%`} accent />
        <Mini label="Avg Win" value={fmtSign(stats.avgWin)} pos />
        <Mini label="Total" value={String(stats.total)} />
        <Mini label="Avg Loss" value={fmtSign(stats.avgLoss)} neg />
      </div>

      <div className="h-[180px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
            <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} width={36} />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              formatter={(v: any, name: any) => [String(v), name]}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function Mini({
  label,
  value,
  pos,
  neg,
  accent,
}: {
  label: string
  value: string
  pos?: boolean
  neg?: boolean
  accent?: boolean
}) {
  const cls = pos
    ? 'text-gain'
    : neg
    ? 'text-loss'
    : accent
    ? 'text-accent'
    : 'text-text'
  return (
    <div className="rounded-lg bg-bg3 border border-soft/40 px-2.5 py-2">
      <div className="text-[10px] uppercase tracking-[0.1em] text-muted2">{label}</div>
      <div className={`mt-0.5 text-[14px] tnum font-semibold ${cls}`}>{value}</div>
    </div>
  )
}
