'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { fmt, num } from '@/lib/format'
import type { AccountInfo, CommissionRate } from '@/types/binance'

interface Props {
  account: AccountInfo | null
  commissionRate: CommissionRate | null
}

function ratePct(r?: string) {
  if (!r) return '—'
  return (num(r) * 100).toFixed(4) + '%'
}

export default function AccountTab({ account, commissionRate }: Props) {
  const initMargin = num(account?.totalInitialMargin)
  const maintMargin = num(account?.totalMaintMargin)
  const openOrderMargin = num(account?.totalOpenOrderInitialMargin)
  const equity = num(account?.totalMarginBalance)
  const ratio = equity > 0 ? (maintMargin / equity) * 100 : 0

  let ratioLabel = 'Healthy'
  let barCls = '[&>div]:bg-emerald-400'
  if (ratio > 80) {
    ratioLabel = 'Critical'
    barCls = '[&>div]:bg-rose-500'
  } else if (ratio > 50) {
    ratioLabel = 'Elevated'
    barCls = '[&>div]:bg-amber-400'
  }

  return (
    <div className="grid gap-4">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <FeeTile label="VIP Tier" value={account ? `VIP ${account.feeTier}` : '—'} cls="text-primary" />
        <FeeTile label="Maker Rate" value={ratePct(commissionRate?.makerCommissionRate)} />
        <FeeTile label="Taker Rate" value={ratePct(commissionRate?.takerCommissionRate)} />
        <FeeTile
          label="BNB Discount"
          value={account?.feeBurn ? 'Enabled' : 'Disabled'}
          cls={account?.feeBurn ? 'text-emerald-400' : 'text-muted-foreground'}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Margin Health</CardTitle>
            <CardDescription>{ratioLabel} · {fmt(ratio, 2)}% used</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Row label="Initial Margin" value={fmt(initMargin)} />
              <Row label="Maintenance Margin" value={fmt(maintMargin)} />
              <Row label="Open Order Margin" value={fmt(openOrderMargin)} />
              <Row
                label="Margin Ratio"
                value={`${fmt(ratio, 2)}%`}
                cls={ratio > 80 ? 'text-rose-400' : ratio > 50 ? 'text-amber-400' : 'text-emerald-400'}
              />
            </div>
            <Progress value={Math.min(100, Math.max(2, ratio))} className={`bg-muted ${barCls}`} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Info</CardTitle>
            <CardDescription>Balances &amp; permissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row label="Cross Wallet Balance" value={fmt(account?.totalCrossWalletBalance || 0)} />
            <Row label="Max Withdraw" value={fmt(account?.maxWithdrawAmount || 0)} />
            <Row
              label="Multi-Assets Mode"
              value={account?.multiAssetsMargin ? 'Enabled' : 'Disabled'}
              cls={account?.multiAssetsMargin ? 'text-sky-400' : 'text-muted-foreground'}
            />
            <Row label="Can Trade" value={account?.canTrade ? 'Yes' : 'No'} cls={account?.canTrade ? 'text-emerald-400' : 'text-rose-400'} />
            <Row label="Can Deposit" value={account?.canDeposit ? 'Yes' : 'No'} cls={account?.canDeposit ? 'text-emerald-400' : 'text-rose-400'} />
            <Row label="Can Withdraw" value={account?.canWithdraw ? 'Yes' : 'No'} cls={account?.canWithdraw ? 'text-emerald-400' : 'text-rose-400'} />
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function Row({ label, value, cls = 'text-foreground' }: { label: string; value: string; cls?: string }) {
  return (
    <div className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium tnum ${cls}`}>{value}</span>
    </div>
  )
}

function FeeTile({ label, value, cls = 'text-foreground' }: { label: string; value: string; cls?: string }) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <div className="text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">{label}</div>
        <div className={`mt-1.5 text-lg font-bold tnum ${cls}`}>{value}</div>
      </CardContent>
    </Card>
  )
}
