'use client'

import PnlLineChart from '@/components/charts/PnlLineChart'
import DistributionBarChart from '@/components/charts/DistributionBarChart'
import PnlCalendar from '@/components/calendar/PnlCalendar'
import type { IncomeRecord } from '@/types/binance'

interface Props {
  pnlIncome: IncomeRecord[]
  walletBalance?: number
}

export default function OverviewTab({ pnlIncome, walletBalance }: Props) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <PnlLineChart records={pnlIncome} />
        <DistributionBarChart records={pnlIncome} />
      </div>
      <PnlCalendar records={pnlIncome} walletBalance={walletBalance} />
    </div>
  )
}
