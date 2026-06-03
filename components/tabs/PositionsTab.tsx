'use client'

import { fmt, fmtSign, fmtTime, num } from '@/lib/format'
import type { Order, Position } from '@/types/binance'

interface Props {
  positions: Position[]
  openOrders: Order[]
}

function deriveSide(p: Position): 'LONG' | 'SHORT' {
  if (p.positionSide === 'LONG') return 'LONG'
  if (p.positionSide === 'SHORT') return 'SHORT'
  return num(p.positionAmt) >= 0 ? 'LONG' : 'SHORT'
}

function roePct(p: Position) {
  const entry = num(p.entryPrice)
  const mark = num(p.markPrice)
  const lev = num(p.leverage)
  if (!entry) return 0
  const side = deriveSide(p) === 'LONG' ? 1 : -1
  return ((mark - entry) / entry) * lev * side * 100
}

function marginValue(p: Position) {
  const iso = num(p.isolatedMargin)
  if (iso) return iso
  const entry = num(p.entryPrice)
  const size = Math.abs(num(p.positionAmt))
  const lev = num(p.leverage) || 1
  return (entry * size) / lev
}

export default function PositionsTab({ positions, openOrders }: Props) {
  return (
    <div className="space-y-5">
      <Section
        title="Open Positions"
        count={positions.length}
        empty="No open positions."
        show={positions.length > 0}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="bg-bg3 text-muted2 text-[10.5px] uppercase tracking-wider">
                <Th left>Symbol</Th>
                <Th>Side</Th>
                <Th right>Size</Th>
                <Th right>Entry</Th>
                <Th right>Mark</Th>
                <Th right>Liq.</Th>
                <Th right>Lev</Th>
                <Th right>Margin</Th>
                <Th right>uPnL</Th>
                <Th right>ROE%</Th>
              </tr>
            </thead>
            <tbody>
              {positions.map((p) => {
                const side = deriveSide(p)
                const upnl = num(p.unRealizedProfit)
                const roe = roePct(p)
                return (
                  <tr
                    key={p.symbol + p.positionSide}
                    className="border-t border-soft/30 hover:bg-card2 transition-colors"
                  >
                    <Td left className="font-medium">{p.symbol}</Td>
                    <Td>
                      <Badge tone={side === 'LONG' ? 'green' : 'red'}>{side}</Badge>
                    </Td>
                    <Td right className="tnum">{fmt(Math.abs(num(p.positionAmt)), 4)}</Td>
                    <Td right className="tnum">{fmt(p.entryPrice, 4)}</Td>
                    <Td right className="tnum">{fmt(p.markPrice, 4)}</Td>
                    <Td right className="tnum text-loss">
                      {num(p.liquidationPrice) ? fmt(p.liquidationPrice, 4) : '—'}
                    </Td>
                    <Td right className="tnum">{p.leverage}x</Td>
                    <Td right className="tnum">{fmt(marginValue(p), 2)}</Td>
                    <Td right className={`tnum ${upnl >= 0 ? 'text-gain' : 'text-loss'}`}>
                      {fmtSign(upnl)}
                    </Td>
                    <Td right className={`tnum ${roe >= 0 ? 'text-gain' : 'text-loss'}`}>
                      {(roe >= 0 ? '+' : '') + roe.toFixed(2)}%
                    </Td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="Open Orders"
        count={openOrders.length}
        empty="No open orders."
        show={openOrders.length > 0}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="bg-bg3 text-muted2 text-[10.5px] uppercase tracking-wider">
                <Th left>Time</Th>
                <Th left>Symbol</Th>
                <Th>Side</Th>
                <Th left>Type</Th>
                <Th right>Qty</Th>
                <Th right>Price</Th>
                <Th right>Stop</Th>
                <Th right>Fill</Th>
                <Th left>Status</Th>
              </tr>
            </thead>
            <tbody>
              {openOrders.map((o) => {
                const qty = num(o.origQty)
                const filled = num(o.executedQty)
                const pct = qty ? (filled / qty) * 100 : 0
                const isMarket = o.type === 'MARKET' || num(o.price) === 0
                return (
                  <tr
                    key={o.orderId}
                    className="border-t border-soft/30 hover:bg-card2 transition-colors"
                  >
                    <Td left className="tnum text-muted2">{fmtTime(o.time)}</Td>
                    <Td left className="font-medium">{o.symbol}</Td>
                    <Td>
                      <Badge tone={o.side === 'BUY' ? 'green' : 'red'}>{o.side}</Badge>
                    </Td>
                    <Td left className="text-muted2">{o.type}</Td>
                    <Td right className="tnum">{fmt(qty, 4)}</Td>
                    <Td right className="tnum">
                      {isMarket ? <span className="text-muted">Market</span> : fmt(o.price, 4)}
                    </Td>
                    <Td right className="tnum">
                      {num(o.stopPrice) ? fmt(o.stopPrice, 4) : <span className="text-muted">—</span>}
                    </Td>
                    <Td right className="tnum">{pct.toFixed(0)}%</Td>
                    <Td left>
                      <span className="inline-flex items-center rounded-md bg-bg3 border border-soft/40 px-1.5 py-0.5 text-[10.5px] text-muted2">
                        {o.status}
                      </span>
                    </Td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  )
}

function Section({
  title,
  count,
  children,
  show,
  empty,
}: {
  title: string
  count: number
  children: React.ReactNode
  show: boolean
  empty: string
}) {
  return (
    <div className="card-base p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] uppercase tracking-[0.14em] text-muted2">{title}</div>
        <div className="text-[11px] text-muted tnum">{count} total</div>
      </div>
      {show ? children : <div className="text-sm text-muted py-6 text-center">{empty}</div>}
    </div>
  )
}

function Th({
  children,
  left,
  right,
}: {
  children: React.ReactNode
  left?: boolean
  right?: boolean
}) {
  return (
    <th
      className={`px-3 py-2.5 font-medium ${
        right ? 'text-right' : left ? 'text-left' : 'text-center'
      }`}
    >
      {children}
    </th>
  )
}

function Td({
  children,
  left,
  right,
  className = '',
}: {
  children: React.ReactNode
  left?: boolean
  right?: boolean
  className?: string
}) {
  return (
    <td
      className={`px-3 py-2.5 ${
        right ? 'text-right' : left ? 'text-left' : 'text-center'
      } ${className}`}
    >
      {children}
    </td>
  )
}

function Badge({ tone, children }: { tone: 'green' | 'red'; children: React.ReactNode }) {
  const cls =
    tone === 'green'
      ? 'bg-gain/15 text-gain border-gain/30'
      : 'bg-loss/15 text-loss border-loss/30'
  return (
    <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10.5px] font-semibold ${cls}`}>
      {children}
    </span>
  )
}
