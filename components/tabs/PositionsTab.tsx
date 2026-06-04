'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { fmt, fmtTime, num } from '@/lib/format'
import { money } from '@/lib/utils'
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

const sideBadge = (s: 'LONG' | 'SHORT' | 'BUY' | 'SELL') =>
  s === 'LONG' || s === 'BUY'
    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
    : 'border-rose-500/30 bg-rose-500/10 text-rose-300'

export default function PositionsTab({ positions, openOrders }: Props) {
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Open Positions</CardTitle>
          <CardDescription>{positions.length} rows</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Side</TableHead>
                <TableHead className="text-right">Size</TableHead>
                <TableHead className="text-right">Entry</TableHead>
                <TableHead className="text-right">Mark</TableHead>
                <TableHead className="text-right">Liq.</TableHead>
                <TableHead className="text-right">Lev</TableHead>
                <TableHead className="text-right">Margin</TableHead>
                <TableHead className="text-right">uPnL</TableHead>
                <TableHead className="text-right">ROE%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.length ? (
                positions.map((p) => {
                  const side = deriveSide(p)
                  const upnl = num(p.unRealizedProfit)
                  const roe = roePct(p)
                  return (
                    <TableRow key={p.symbol + p.positionSide}>
                      <TableCell className="font-semibold">{p.symbol}</TableCell>
                      <TableCell>
                        <Badge className={sideBadge(side)}>{side}</Badge>
                      </TableCell>
                      <TableCell className="text-right tnum">{fmt(Math.abs(num(p.positionAmt)), 4)}</TableCell>
                      <TableCell className="text-right tnum">{fmt(p.entryPrice, 4)}</TableCell>
                      <TableCell className="text-right tnum">{fmt(p.markPrice, 4)}</TableCell>
                      <TableCell className="text-right tnum text-rose-400">
                        {num(p.liquidationPrice) ? fmt(p.liquidationPrice, 4) : '—'}
                      </TableCell>
                      <TableCell className="text-right tnum">{p.leverage}x</TableCell>
                      <TableCell className="text-right tnum">{fmt(marginValue(p), 2)}</TableCell>
                      <TableCell className={`text-right tnum ${upnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {money(upnl)}
                      </TableCell>
                      <TableCell className={`text-right tnum ${roe >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {(roe >= 0 ? '+' : '') + roe.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                    No open positions
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Open Orders</CardTitle>
          <CardDescription>{openOrders.length} rows</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Side</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stop</TableHead>
                <TableHead className="text-right">Fill</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {openOrders.length ? (
                openOrders.map((o) => {
                  const qty = num(o.origQty)
                  const filled = num(o.executedQty)
                  const pct = qty ? (filled / qty) * 100 : 0
                  const isMarket = o.type === 'MARKET' || num(o.price) === 0
                  return (
                    <TableRow key={o.orderId}>
                      <TableCell className="tnum text-muted-foreground">{fmtTime(o.time)}</TableCell>
                      <TableCell className="font-semibold">{o.symbol}</TableCell>
                      <TableCell>
                        <Badge className={sideBadge(o.side)}>{o.side}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{o.type}</TableCell>
                      <TableCell className="text-right tnum">{fmt(qty, 4)}</TableCell>
                      <TableCell className="text-right tnum">
                        {isMarket ? <span className="text-muted-foreground">Market</span> : fmt(o.price, 4)}
                      </TableCell>
                      <TableCell className="text-right tnum">
                        {num(o.stopPrice) ? fmt(o.stopPrice, 4) : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-right tnum">{pct.toFixed(0)}%</TableCell>
                      <TableCell>
                        <Badge className="border-border bg-muted/40 text-muted-foreground">{o.status}</Badge>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                    No open orders
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
