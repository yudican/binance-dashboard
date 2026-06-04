'use client'

import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import FundingLineChart from '@/components/charts/FundingLineChart'
import IncomeDonutChart from '@/components/charts/IncomeDonutChart'
import { fmtSign, fmtTime, num } from '@/lib/format'
import type { IncomeRecord } from '@/types/binance'

type Filter = 'ALL' | 'REALIZED_PNL' | 'FUNDING_FEE' | 'COMMISSION' | 'TRANSFER'

interface Props {
  allIncome: IncomeRecord[]
  fundingIncome: IncomeRecord[]
  commissionIncome?: IncomeRecord[]
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'REALIZED_PNL', label: 'Realized PnL' },
  { key: 'FUNDING_FEE', label: 'Funding Fee' },
  { key: 'COMMISSION', label: 'Commission' },
  { key: 'TRANSFER', label: 'Transfer' },
]

const TYPE_STYLE: Record<string, string> = {
  REALIZED_PNL: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  FUNDING_FEE: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  COMMISSION: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
  TRANSFER: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
}

export default function IncomeTab({ allIncome, fundingIncome, commissionIncome = [] }: Props) {
  const [filter, setFilter] = useState<Filter>('ALL')

  const filtered = useMemo(() => {
    const rows = filter === 'ALL' ? allIncome : allIncome.filter((r) => r.incomeType === filter)
    return [...rows].sort((a, b) => b.time - a.time).slice(0, 200)
  }, [allIncome, filter])

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Income History</CardTitle>
          <CardDescription>{filtered.length} rows</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                  filter === f.key
                    ? 'border-primary/50 bg-primary/15 text-primary'
                    : 'border-border bg-background/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Info</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length ? (
                filtered.map((r, i) => {
                  const amt = num(r.income)
                  return (
                    <TableRow key={r.tranId + '-' + i}>
                      <TableCell className="whitespace-nowrap tnum text-muted-foreground">{fmtTime(r.time)}</TableCell>
                      <TableCell>
                        <Badge className={TYPE_STYLE[r.incomeType] || 'border-border bg-muted/40 text-muted-foreground'}>
                          {r.incomeType.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">{r.symbol || '—'}</TableCell>
                      <TableCell className={`text-right tnum font-semibold ${amt >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {fmtSign(amt, 6)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{r.asset}</TableCell>
                      <TableCell className="max-w-[260px] truncate text-muted-foreground">{r.info || '—'}</TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No records
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-12">
        <FundingLineChart records={fundingIncome} className="xl:col-span-7" />
        <IncomeDonutChart records={allIncome} className="xl:col-span-5" />
      </div>
    </div>
  )
}
