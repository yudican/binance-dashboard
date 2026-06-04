'use client'

import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { daysAgo, fmtTime, num, startOfDay } from '@/lib/format'
import { money } from '@/lib/utils'
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
    const cutoff = period === 'today' ? startOfDay(Date.now()) : period === '7d' ? daysAgo(7) : daysAgo(30)
    return pnlIncome
      .filter((r) => r.time >= cutoff && r.incomeType === 'REALIZED_PNL')
      .sort((a, b) => b.time - a.time)
  }, [pnlIncome, period])

  const total = rows.reduce((a, r) => a + num(r.income), 0)
  const wins = rows.filter((r) => num(r.income) > 0).length
  const losses = rows.filter((r) => num(r.income) < 0).length

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Trade Journal</CardTitle>
          <CardDescription>{rows.length} realized trades</CardDescription>
        </div>
        <div className="flex gap-1.5">
          {OPTIONS.map((o) => (
            <button
              key={o.key}
              onClick={() => setPeriod(o.key)}
              className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                period === o.key
                  ? 'border-primary/50 bg-primary/15 text-primary'
                  : 'border-border bg-background/40 text-muted-foreground hover:text-foreground'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Trades" value={String(rows.length)} />
          <Stat label="Wins" value={String(wins)} cls="text-emerald-400" />
          <Stat label="Losses" value={String(losses)} cls="text-rose-400" />
          <Stat label="Net" value={money(total)} cls={total >= 0 ? 'text-emerald-400' : 'text-rose-400'} />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead className="text-right">Realized PnL</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((r, i) => {
                const amt = num(r.income)
                return (
                  <TableRow key={(r.tradeId || r.tranId || '') + '-' + i}>
                    <TableCell className="whitespace-nowrap tnum text-muted-foreground">{fmtTime(r.time)}</TableCell>
                    <TableCell className="font-semibold">{r.symbol || '—'}</TableCell>
                    <TableCell className={`text-right tnum font-semibold ${amt >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {money(amt)}
                    </TableCell>
                    <TableCell>
                      <Badge className="border-border bg-muted/40 text-muted-foreground">REALIZED PNL</Badge>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  No realized trades in this period
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function Stat({ label, value, cls = 'text-foreground' }: { label: string; value: string; cls?: string }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 text-lg font-bold tnum ${cls}`}>{value}</div>
    </div>
  )
}
