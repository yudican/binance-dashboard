'use client'

import { useMemo, useState } from 'react'
import StatCard from './StatCard'
import TabNav, { TabKey } from './TabNav'
import OverviewTab from '@/components/tabs/OverviewTab'
import PositionsTab from '@/components/tabs/PositionsTab'
import IncomeTab from '@/components/tabs/IncomeTab'
import JournalTab, { JournalPeriod } from '@/components/tabs/JournalTab'
import AccountTab from '@/components/tabs/AccountTab'
import { daysAgo, fmt, fmtSign, num, startOfDay } from '@/lib/format'
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

const PERIOD_LABEL: Record<JournalPeriod, string> = {
  today: "Today's PnL",
  '7d': '7D PnL',
  '30d': '30D PnL',
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
  firstLoad,
  marks = {},
}: Props) {
  const [tab, setTab] = useState<TabKey>('overview')
  const [journalPeriod, setJournalPeriod] = useState<JournalPeriod>('today')

  // Overlay live mark prices onto positions and recompute uPnL in realtime.
  const livePositions = useMemo(() => {
    return positions.map((p) => {
      const mark = marks[p.symbol]
      if (!mark || !isFinite(mark)) return p
      const entry = num(p.entryPrice)
      const amt = num(p.positionAmt)
      const liveUpnl = (mark - entry) * amt
      return {
        ...p,
        markPrice: String(mark),
        unRealizedProfit: String(liveUpnl),
      }
    })
  }, [positions, marks])

  // Live total unrealized PnL across positions (falls back to account value).
  const liveUnrealized = useMemo(() => {
    if (!Object.keys(marks).length) return num(account?.totalUnrealizedProfit || 0)
    return livePositions.reduce((a, p) => a + num(p.unRealizedProfit), 0)
  }, [livePositions, marks, account])

  const periodPnl = useMemo(() => {
    const cutoff =
      journalPeriod === 'today'
        ? startOfDay(Date.now())
        : journalPeriod === '7d'
        ? daysAgo(7)
        : daysAgo(30)
    return pnlIncome
      .filter((r) => r.time >= cutoff && r.incomeType === 'REALIZED_PNL')
      .reduce((a, r) => a + num(r.income), 0)
  }, [pnlIncome, journalPeriod])

  const fundingSum = useMemo(
    () => fundingIncome.reduce((a, r) => a + num(r.income), 0),
    [fundingIncome]
  )
  const commissionSum = useMemo(
    () => commissionIncome.reduce((a, r) => a + num(r.income), 0),
    [commissionIncome]
  )

  const animCls = firstLoad ? 'animate-fadeUp' : ''

  return (
    <main className="mx-auto max-w-[1400px] px-4 sm:px-6 py-5 space-y-5">
      <section
        className={`grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3 ${animCls}`}
        style={firstLoad ? { animationDelay: '40ms' } : undefined}
      >
        <StatCard
          label="Wallet Balance"
          value={fmt(account?.totalWalletBalance || 0)}
          sub="USDT"
          color="yellow"
        />
        <StatCard
          label="Unrealized PnL"
          value={fmtSign(liveUnrealized)}
          sub="open positions"
          color="green"
          valueColor="auto"
          rawValue={liveUnrealized}
        />
        <StatCard
          label="Available Margin"
          value={fmt(account?.availableBalance || 0)}
          sub="for new orders"
          color="blue"
        />
        <StatCard
          label={PERIOD_LABEL[journalPeriod]}
          value={fmtSign(periodPnl)}
          sub="realized"
          color="green"
          valueColor="auto"
          rawValue={periodPnl}
        />
        <StatCard
          label="Total Equity"
          value={fmt(num(account?.totalWalletBalance || 0) + liveUnrealized)}
          sub="wallet + uPnL"
          color="yellow"
        />
        <StatCard
          label="Open Positions"
          value={String(positions.length)}
          sub={`${openOrders.length} open orders`}
          color="blue"
        />
        <StatCard
          label="30D Funding"
          value={fmtSign(fundingSum)}
          sub="net funding"
          color="red"
          valueColor="auto"
          rawValue={fundingSum}
        />
        <StatCard
          label="30D Commission"
          value={fmtSign(commissionSum)}
          sub="fees paid"
          color="orange"
          valueColor="auto"
          rawValue={commissionSum}
        />
      </section>

      <section
        className={`card-base ${animCls}`}
        style={firstLoad ? { animationDelay: '120ms' } : undefined}
      >
        <TabNav active={tab} onChange={setTab} />
        <div className="p-5">
          {tab === 'overview' && (
            <OverviewTab
              pnlIncome={pnlIncome}
              walletBalance={num(account?.totalWalletBalance || 0)}
            />
          )}
          {tab === 'positions' && (
            <PositionsTab positions={livePositions} openOrders={openOrders} />
          )}
          {tab === 'income' && (
            <IncomeTab allIncome={allIncome} fundingIncome={fundingIncome} />
          )}
          {tab === 'journal' && (
            <JournalTab
              pnlIncome={pnlIncome}
              period={journalPeriod}
              setPeriod={setJournalPeriod}
            />
          )}
          {tab === 'account' && (
            <AccountTab account={account} commissionRate={commissionRate} />
          )}
        </div>
      </section>
    </main>
  )
}
