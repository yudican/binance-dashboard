'use client'

import { fmt, num } from '@/lib/format'
import type { AccountInfo, CommissionRate } from '@/types/binance'

interface Props {
  account: AccountInfo | null
  commissionRate: CommissionRate | null
}

function ratePct(r?: string) {
  if (!r) return '—'
  const v = num(r) * 100
  return v.toFixed(4) + '%'
}

export default function AccountTab({ account, commissionRate }: Props) {
  const initMargin = num(account?.totalInitialMargin)
  const maintMargin = num(account?.totalMaintMargin)
  const openOrderMargin = num(account?.totalOpenOrderInitialMargin)
  const equity = num(account?.totalMarginBalance)
  const ratio = equity > 0 ? (maintMargin / equity) * 100 : 0

  let barColor = '#0ecb81'
  let ratioLabel = 'Healthy'
  if (ratio > 80) {
    barColor = '#f6465d'
    ratioLabel = 'Critical'
  } else if (ratio > 50) {
    barColor = '#f77f00'
    ratioLabel = 'Elevated'
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FeeTile label="VIP Tier" value={account ? `VIP ${account.feeTier}` : '—'} accent />
        <FeeTile label="Maker Rate" value={ratePct(commissionRate?.makerCommissionRate)} />
        <FeeTile label="Taker Rate" value={ratePct(commissionRate?.takerCommissionRate)} />
        <FeeTile
          label="BNB Discount"
          value={account?.feeBurn ? 'Enabled' : 'Disabled'}
          tone={account?.feeBurn ? 'on' : 'off'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card-base p-5">
          <div className="text-[11px] uppercase tracking-[0.14em] text-muted2 mb-3">
            Margin Health
          </div>
          <div className="space-y-3">
            <Row label="Initial Margin" value={fmt(initMargin)} />
            <Row label="Maintenance Margin" value={fmt(maintMargin)} />
            <Row label="Open Order Margin" value={fmt(openOrderMargin)} />
            <Row
              label="Margin Ratio"
              value={`${fmt(ratio, 2)}%`}
              valueClass={
                ratio > 80 ? 'text-loss' : ratio > 50 ? 'text-warn' : 'text-gain'
              }
            />
          </div>
          <div className="mt-5">
            <div className="flex items-center justify-between text-[11px] text-muted2 mb-1.5">
              <span>{ratioLabel}</span>
              <span className="tnum">{fmt(ratio, 2)}% used</span>
            </div>
            <div className="h-2 rounded-full bg-bg3 overflow-hidden border border-soft/30">
              <div
                className="h-full rounded-full transition-[width,background-color] duration-700"
                style={{
                  width: `${Math.min(100, Math.max(2, ratio))}%`,
                  background: barColor,
                  boxShadow: `0 0 10px ${barColor}66`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="card-base p-5">
          <div className="text-[11px] uppercase tracking-[0.14em] text-muted2 mb-3">
            Account Info
          </div>
          <div className="space-y-3">
            <Row
              label="Cross Wallet Balance"
              value={fmt(account?.totalCrossWalletBalance || 0)}
            />
            <Row label="Max Withdraw" value={fmt(account?.maxWithdrawAmount || 0)} />
            <Row
              label="Multi-Assets Mode"
              value={account?.multiAssetsMargin ? 'Enabled' : 'Disabled'}
              valueClass={account?.multiAssetsMargin ? 'text-info' : 'text-muted2'}
            />
            <Row
              label="Can Trade"
              value={account?.canTrade ? 'Yes' : 'No'}
              valueClass={account?.canTrade ? 'text-gain' : 'text-loss'}
            />
            <Row
              label="Can Deposit"
              value={account?.canDeposit ? 'Yes' : 'No'}
              valueClass={account?.canDeposit ? 'text-gain' : 'text-loss'}
            />
            <Row
              label="Can Withdraw"
              value={account?.canWithdraw ? 'Yes' : 'No'}
              valueClass={account?.canWithdraw ? 'text-gain' : 'text-loss'}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  valueClass = 'text-text',
}: {
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="flex items-center justify-between border-b border-soft/30 pb-2 last:border-0 last:pb-0">
      <span className="text-[12px] text-muted2">{label}</span>
      <span className={`tnum text-[13px] font-medium ${valueClass}`}>{value}</span>
    </div>
  )
}

function FeeTile({
  label,
  value,
  accent,
  tone,
}: {
  label: string
  value: string
  accent?: boolean
  tone?: 'on' | 'off'
}) {
  const valCls = accent
    ? 'text-accent'
    : tone === 'on'
    ? 'text-gain'
    : tone === 'off'
    ? 'text-muted2'
    : 'text-text'
  return (
    <div className="card-base px-4 py-3.5">
      <div className="text-[10.5px] uppercase tracking-[0.12em] text-muted2">{label}</div>
      <div className={`mt-1.5 text-[18px] tnum font-semibold ${valCls}`}>{value}</div>
    </div>
  )
}
