'use client'

import { useMemo, useState } from 'react'
import {
  Activity,
  CircleDollarSign,
  Radio,
  TrendingUp,
  WalletCards,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { addDays, endOfMonth, format, subMonths } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PnlCalendar from '@/components/calendar/PnlCalendar'
import PositionsTab from '@/components/tabs/PositionsTab'
import IncomeTab from '@/components/tabs/IncomeTab'
import JournalTab, { JournalPeriod } from '@/components/tabs/JournalTab'
import AccountTab from '@/components/tabs/AccountTab'
import { money, percent } from '@/lib/utils'
import { num, startOfDay } from '@/lib/format'
import type {
  AccountInfo,
  CommissionRate,
  IncomeRecord,
  Order,
  Position,
} from '@/types/binance'

interface Props {
  account: AccountInfo | null
  positions: Position[]
  openOrders: Order[]
  pnlIncome: IncomeRecord[]
  fundingIncome: IncomeRecord[]
  commissionIncome: IncomeRecord[]
  allIncome: IncomeRecord[]
  commissionRate: CommissionRate | null
  firstLoad: boolean
  /** Live mark prices from websocket: symbol -> price */
  marks?: Record<string, number>
}

interface Summary {
  net_pnl: number
  today_pnl: number
  win_rate: number
  day_win_rate: number
  profit_factor: number
  avg_win: number
  avg_loss: number
  total_trades: number
  winning_trades: number
  losing_trades: number
  balance: number
  equity: number
  margin: number
  free_margin: number
  margin_level: number
  active_notional: number
  active_positions: number
}

export default function Dashboard({
  account,
  positions,
  openOrders,
  pnlIncome,
  fundingIncome,
  commissionIncome,
  allIncome,
  commissionRate,
  marks = {},
}: Props) {
  const [journalPeriod, setJournalPeriod] = useState<JournalPeriod>('today')
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date())

  // Overlay live mark prices and recompute uPnL in realtime.
  const livePositions = useMemo(() => {
    return positions.map((p) => {
      const mark = marks[p.symbol]
      if (!mark || !isFinite(mark)) return p
      const entry = num(p.entryPrice)
      const amt = num(p.positionAmt)
      return {
        ...p,
        markPrice: String(mark),
        unRealizedProfit: String((mark - entry) * amt),
      }
    })
  }, [positions, marks])

  const liveUnrealized = useMemo(() => {
    if (!Object.keys(marks).length) return num(account?.totalUnrealizedProfit || 0)
    return livePositions.reduce((a, p) => a + num(p.unRealizedProfit), 0)
  }, [livePositions, marks, account])

  // Daily realized PnL buckets (yyyy-MM-dd -> pnl).
  const daily = useMemo(() => {
    const byDay = new Map<string, number>()
    for (const r of pnlIncome) {
      if (r.incomeType !== 'REALIZED_PNL') continue
      const key = format(new Date(r.time), 'yyyy-MM-dd')
      byDay.set(key, (byDay.get(key) || 0) + num(r.income))
    }
    return Array.from(byDay.entries())
      .map(([date, pnl]) => ({ date, pnl }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [pnlIncome])

  const equityCurve = useMemo(() => {
    let cum = 0
    return daily.map((d) => {
      cum += d.pnl
      return { time: d.date, value: cum }
    })
  }, [daily])

  const s: Summary = useMemo(() => {
    const realized = pnlIncome.filter((r) => r.incomeType === 'REALIZED_PNL')
    const todayStart = startOfDay(Date.now())
    let net = 0
    let today = 0
    let grossWin = 0
    let grossLoss = 0
    let wins = 0
    let losses = 0
    for (const r of realized) {
      const v = num(r.income)
      net += v
      if (r.time >= todayStart) today += v
      if (v > 0) {
        wins++
        grossWin += v
      } else if (v < 0) {
        losses++
        grossLoss += Math.abs(v)
      }
    }
    const total = wins + losses
    const winDays = daily.filter((d) => d.pnl > 0).length
    const lossDays = daily.filter((d) => d.pnl < 0).length

    const usedMargin = num(account?.totalPositionInitialMargin)
    const equity = num(account?.totalMarginBalance) || num(account?.totalWalletBalance) + liveUnrealized
    const notional = livePositions.reduce(
      (a, p) => a + Math.abs(num(p.positionAmt)) * num(p.markPrice),
      0
    )

    return {
      net_pnl: net,
      today_pnl: today,
      win_rate: total ? (wins / total) * 100 : 0,
      day_win_rate: winDays + lossDays ? (winDays / (winDays + lossDays)) * 100 : 0,
      profit_factor: grossLoss ? grossWin / grossLoss : grossWin > 0 ? grossWin : 0,
      avg_win: wins ? grossWin / wins : 0,
      avg_loss: losses ? -grossLoss / losses : 0,
      total_trades: total,
      winning_trades: wins,
      losing_trades: losses,
      balance: num(account?.totalWalletBalance),
      equity,
      margin: usedMargin,
      free_margin: num(account?.availableBalance),
      margin_level: usedMargin > 0 ? (equity / usedMargin) * 100 : 0,
      active_notional: notional,
      active_positions: positions.length,
    }
  }, [pnlIncome, daily, account, livePositions, liveUnrealized, positions.length])

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <div className="overflow-x-auto pb-1 tab-scroll">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="positions">Positions &amp; Orders</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="journal">Journal</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="overview" className="space-y-4">
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Metric
            title="Net P&L"
            value={money(s.net_pnl)}
            helper={`Today ${money(s.today_pnl)}`}
            icon={<CircleDollarSign />}
            tone={s.net_pnl >= 0 ? 'good' : 'bad'}
          />
          <Metric
            title="Position win %"
            value={percent(s.win_rate)}
            helper={`${s.total_trades} trades`}
            icon={<TrendingUp />}
          />
          <Metric
            title="Profit factor"
            value={s.profit_factor.toFixed(2)}
            helper="Gross profit / gross loss"
            progress={Math.min((s.profit_factor / 3) * 100, 100)}
            icon={<Activity />}
          />
          <Metric
            title="Day win %"
            value={percent(s.day_win_rate)}
            helper="Closed daily P&L"
            icon={<WalletCards />}
          />
          <Metric
            title="Avg win/loss"
            value={`$${s.avg_win.toFixed(2)} / -$${Math.abs(s.avg_loss).toFixed(2)}`}
            helper="Realized trades"
            split
            icon={<Radio />}
          />
        </section>

        <section className="grid items-stretch gap-4 xl:grid-cols-12">
          <div className="grid gap-4 xl:col-span-4 xl:grid-rows-2">
            <SummaryCard summary={s} openOrders={openOrders.length} liveUnrealized={liveUnrealized} />
            <PerformanceCard summary={s} />
          </div>
          <Card className="xl:col-span-8">
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Realized PnL</CardTitle>
                <CardDescription>Monthly realized profit calendar</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}>‹</Button>
                <Button variant="outline" size="sm" onClick={() => setCalendarMonth(new Date())}>Today</Button>
                <Button variant="outline" size="sm" onClick={() => setCalendarMonth(addDays(endOfMonth(calendarMonth), 1))}>›</Button>
              </div>
            </CardHeader>
            <CardContent>
              <PnlCalendar month={calendarMonth} daily={daily} />
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 xl:grid-cols-12">
          <ChartCard title="Cumulative P&L" className="xl:col-span-8" data={equityCurve} type="area" />
          <ChartCard title="Daily P&L" className="xl:col-span-4" data={daily.map((d) => ({ time: d.date, value: d.pnl }))} type="bar" />
        </section>
      </TabsContent>

      <TabsContent value="positions">
        <PositionsTab positions={livePositions} openOrders={openOrders} />
      </TabsContent>
      <TabsContent value="income">
        <IncomeTab allIncome={allIncome} fundingIncome={fundingIncome} commissionIncome={commissionIncome} />
      </TabsContent>
      <TabsContent value="journal">
        <JournalTab pnlIncome={pnlIncome} period={journalPeriod} setPeriod={setJournalPeriod} />
      </TabsContent>
      <TabsContent value="account">
        <AccountTab account={account} commissionRate={commissionRate} />
      </TabsContent>
    </Tabs>
  )
}

function Metric({
  title,
  value,
  helper,
  icon,
  progress,
  split,
  tone,
}: {
  title: string
  value: string
  helper: string
  icon: React.ReactNode
  progress?: number
  split?: boolean
  tone?: 'good' | 'bad'
}) {
  return (
    <Card className="metric-glow overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between text-muted-foreground">
          <CardDescription>{title}</CardDescription>
          <div className="h-4 w-4">{icon}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={`text-2xl font-black tracking-tight sm:text-3xl ${
            tone === 'good' ? 'text-emerald-400' : tone === 'bad' ? 'text-rose-400' : ''
          }`}
        >
          {value}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{helper}</p>
        {progress !== undefined && <Progress value={progress} className="mt-4 bg-rose-500 [&>div]:bg-emerald-400" />}
        {split && (
          <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-rose-500">
            <div className="w-3/5 bg-emerald-400" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SummaryCard({
  summary,
  openOrders,
  liveUnrealized,
}: {
  summary: Summary
  openOrders: number
  liveUnrealized: number
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Account Summary</CardTitle>
        <CardDescription>{summary.active_positions} positions · {openOrders} orders</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-4">
        <InfoGrid
          items={[
            ['Wallet', money(summary.balance, false)],
            ['Equity', money(summary.equity, false)],
            ['Used Margin', money(summary.margin, false)],
            ['Available', money(summary.free_margin, false)],
            ['Margin Level', summary.margin_level ? percent(summary.margin_level) : '—'],
            ['Open Notional', money(summary.active_notional, false)],
          ]}
        />
        <NeonStrip label="Unrealized PnL" value={money(liveUnrealized)} amount={liveUnrealized} />
      </CardContent>
    </Card>
  )
}

function PerformanceCard({ summary }: { summary: Summary }) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Performance</CardTitle>
        <CardDescription>{summary.winning_trades}W · {summary.losing_trades}L</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-4">
        <InfoGrid
          items={[
            ['Account', 'Binance USDT-M'],
            ['Net Worth', money(summary.equity, false)],
            ['Net P&L', money(summary.net_pnl)],
            ['Win Rate', percent(summary.win_rate)],
          ]}
        />
        <NeonStrip label="Total Profit" value={money(summary.net_pnl)} amount={summary.net_pnl} />
      </CardContent>
    </Card>
  )
}

function InfoGrid({ items }: { items: [string, string][] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-4 text-xs">
          <span className="text-muted-foreground">{k}</span>
          <b className={v.startsWith('-') ? 'text-rose-400' : v.startsWith('+') ? 'text-emerald-400' : ''}>{v}</b>
        </div>
      ))}
    </div>
  )
}

function NeonStrip({ label, value, amount = 0 }: { label: string; value: string; amount?: number }) {
  const neg = amount < 0
  return (
    <div
      className={`flex items-center justify-between rounded-lg border bg-[length:8px_8px] p-3 ${
        neg
          ? 'border-rose-500/10 bg-[radial-gradient(circle,rgba(244,63,94,.35)_1px,transparent_1px)] text-rose-400'
          : 'border-emerald-500/10 bg-[radial-gradient(circle,rgba(16,185,129,.35)_1px,transparent_1px)] text-emerald-400'
      }`}
    >
      <span>{label}</span>
      <b className="text-lg">{value}</b>
    </div>
  )
}

function ChartCard({
  title,
  data,
  type,
  className,
}: {
  title: string
  data: { time: string | null; value: number }[]
  type: 'area' | 'bar'
  className?: string
}) {
  const neg = type === 'area' && data.length > 0 && data[data.length - 1].value < 0
  const lineColor = neg ? '#f43f5e' : '#34d399'
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{data.length ? `${data.length} points` : 'No data yet'}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          {data.length ? (
            <ResponsiveContainer width="100%" height="100%">
              {type === 'area' ? (
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="pnl" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor={lineColor} stopOpacity={0.45} />
                      <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,.07)" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis width={42} stroke="#73737f" />
                  <Tooltip contentStyle={{ background: '#141418', border: '1px solid #2d2d33', borderRadius: 12 }} />
                  <Area type="monotone" dataKey="value" stroke={lineColor} fill="url(#pnl)" strokeWidth={2} />
                </AreaChart>
              ) : (
                <BarChart data={data}>
                  <CartesianGrid stroke="rgba(255,255,255,.07)" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis width={42} stroke="#73737f" />
                  <Tooltip contentStyle={{ background: '#141418', border: '1px solid #2d2d33', borderRadius: 12 }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {data.map((d, i) => (
                      <Cell key={i} fill={d.value < 0 ? '#f43f5e' : '#34d399'} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="grid h-full place-items-center rounded-xl border bg-muted/20 text-sm text-muted-foreground">
              No {title.toLowerCase()} yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
