# Binance Futures Dashboard — Next.js

A full-featured Binance USDT-M Futures dashboard. Dark, responsive, and elegant.
All API calls are signed server-side via Next.js API Routes to keep the secret key off the client.

---

## Tech Stack

- **Next.js latest
- **TypeScript**
- **Tailwind CSS** (dark theme, custom design tokens)
- **Recharts** — line charts, bar charts, donut charts
- **IBM Plex Mono + Syne** (Google Fonts)
- **Session persistence** via `sessionStorage` (client) + server-side signing

---

## Design Tokens

Use these exact values as your Tailwind config or CSS variables:

```
bg:       #0a0c10   (page background)
bg2:      #0f1218
bg3:      #141820   (input backgrounds)
card:     #131820   (card background)
card2:    #1a2030   (hover state)
border:   rgba(255,255,255,0.06)
border2:  rgba(255,255,255,0.12)
text:     #e8eaf0
muted:    #6b7280
muted2:   #9ca3af
accent:   #f0b90b   (Binance yellow — primary actions, active states)
green:    #0ecb81   (profit, positive)
red:      #f6465d   (loss, negative, liquidation)
blue:     #1890ff   (neutral info)
orange:   #f77f00   (funding fees, warnings)
```

---

## Project Structure

```
app/
  layout.tsx                  ← fonts, global styles, metadata
  page.tsx                    ← root: shows LoginModal if no session, else Dashboard
  api/
    binance/
      route.ts                ← proxy + HMAC signer for all Binance API calls

components/
  auth/
    LoginModal.tsx            ← modal overlay with API key + secret inputs
  layout/
    Header.tsx                ← logo, live status dot, Refresh + Logout buttons
  dashboard/
    Dashboard.tsx             ← tab controller, top stats grid, data orchestration
    StatCard.tsx              ← reusable metric card with colored top border
    TabNav.tsx                ← tab navigation bar
  tabs/
    OverviewTab.tsx           ← PnL chart + distribution + calendar
    PositionsTab.tsx          ← open positions table + open orders table
    IncomeTab.tsx             ← income history table + funding chart + breakdown donut
    JournalTab.tsx            ← trade journal table with period filter
    AccountTab.tsx            ← fee info, margin health bar, account details
  charts/
    PnlLineChart.tsx          ← cumulative PnL line chart (7D/30D/90D)
    FundingLineChart.tsx      ← cumulative funding fee line chart
    DistributionBarChart.tsx  ← win/loss count bar chart
    IncomeDonutChart.tsx      ← PnL vs funding vs commission donut
  calendar/
    PnlCalendar.tsx           ← monthly PnL heatmap calendar with nav

hooks/
  useBinance.ts               ← main data fetcher, returns all data + loading/error state
  useSession.ts               ← reads/writes API key+secret from sessionStorage

types/
  binance.ts                  ← all TypeScript interfaces for API responses

lib/
  binance.ts                  ← client-side fetch wrapper (calls /api/binance)
  format.ts                   ← fmt(), fmtSign(), fmtTime() utilities
```

---

## API Route — `/api/binance/route.ts`

Single POST endpoint. Client sends `{ path, params }`, server signs and forwards to Binance.

```ts
// app/api/binance/route.ts
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const { path, params = {}, apiKey, apiSecret } = await req.json()

  const timestamp = Date.now()
  const recvWindow = 6000
  const query = new URLSearchParams({ ...params, timestamp: String(timestamp), recvWindow: String(recvWindow) })
  const signature = crypto.createHmac('sha256', apiSecret).update(query.toString()).digest('hex')
  query.append('signature', signature)

  const url = `https://fapi.binance.com${path}?${query.toString()}`
  const res = await fetch(url, { headers: { 'X-MBX-APIKEY': apiKey } })
  const data = await res.json()

  if (!res.ok) return NextResponse.json({ error: data.msg || 'Binance error' }, { status: res.status })
  return NextResponse.json(data)
}
```

**Security note:** Never expose `apiSecret` to the browser. Always pass it through this route.
If you store keys in `.env`, use `BINANCE_API_KEY` and `BINANCE_API_SECRET` and skip sending them from the client entirely (single-user setup).

---

## Client Fetcher — `lib/binance.ts`

```ts
export async function binanceFetch(
  path: string,
  params: Record<string, string> = {},
  apiKey: string,
  apiSecret: string
) {
  const res = await fetch('/api/binance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, params, apiKey, apiSecret }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}
```

---

## Session Hook — `hooks/useSession.ts`

```ts
export function useSession() {
  const get = () => ({
    apiKey: sessionStorage.getItem('bn_k') || '',
    apiSecret: sessionStorage.getItem('bn_s') || '',
  })
  const set = (apiKey: string, apiSecret: string) => {
    sessionStorage.setItem('bn_k', apiKey)
    sessionStorage.setItem('bn_s', apiSecret)
  }
  const clear = () => {
    sessionStorage.removeItem('bn_k')
    sessionStorage.removeItem('bn_s')
  }
  const isAuthenticated = () => !!(sessionStorage.getItem('bn_k') && sessionStorage.getItem('bn_s'))
  return { get, set, clear, isAuthenticated }
}
```

Session lives only for the browser tab. Closing the tab clears the keys automatically.

---

## Main Data Hook — `hooks/useBinance.ts`

Fetches all endpoints in parallel. Call `refresh()` to manually re-fetch.
Auto-refresh every 30 seconds when authenticated.

```ts
// Endpoints fetched in a single Promise.all:
const [
  account,         // GET /fapi/v2/account
  positionRisk,    // GET /fapi/v2/positionRisk
  openOrders,      // GET /fapi/v1/openOrders
  pnlIncome,       // GET /fapi/v1/income  { incomeType: 'REALIZED_PNL', limit: 1000 }
  fundingIncome,   // GET /fapi/v1/income  { incomeType: 'FUNDING_FEE',  limit: 1000, startTime: 30d ago }
  commissionIncome,// GET /fapi/v1/income  { incomeType: 'COMMISSION',   limit: 1000, startTime: 30d ago }
  allIncome,       // GET /fapi/v1/income  { limit: 1000 }  — for income history tab
  commissionRate,  // GET /fapi/v1/commissionRate { symbol: 'BTCUSDT' }
] = await Promise.all([...])
```

Return shape:
```ts
{
  account: AccountInfo | null
  positions: Position[]           // filtered: positionAmt !== 0
  openOrders: Order[]
  pnlIncome: IncomeRecord[]       // REALIZED_PNL only
  fundingIncome: IncomeRecord[]   // FUNDING_FEE only
  commissionIncome: IncomeRecord[]
  allIncome: IncomeRecord[]       // all types combined
  commissionRate: CommissionRate | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  lastUpdated: Date | null
}
```

---

## TypeScript Interfaces — `types/binance.ts`

```ts
export interface AccountInfo {
  feeTier: number
  feeBurn: boolean
  canTrade: boolean
  canDeposit: boolean
  canWithdraw: boolean
  multiAssetsMargin: boolean
  totalWalletBalance: string
  totalUnrealizedProfit: string
  totalMarginBalance: string
  totalInitialMargin: string
  totalMaintMargin: string
  totalPositionInitialMargin: string
  totalOpenOrderInitialMargin: string
  availableBalance: string
  maxWithdrawAmount: string
  totalCrossWalletBalance: string
}

export interface Position {
  symbol: string
  positionAmt: string
  entryPrice: string
  markPrice: string
  unRealizedProfit: string
  liquidationPrice: string
  leverage: string
  isolatedMargin: string
  positionSide: 'BOTH' | 'LONG' | 'SHORT'
  updateTime: number
}

export interface Order {
  orderId: number
  symbol: string
  status: string
  side: 'BUY' | 'SELL'
  type: string
  price: string
  origQty: string
  executedQty: string
  stopPrice: string
  time: number
  updateTime: number
}

export interface IncomeRecord {
  symbol: string
  incomeType: 'REALIZED_PNL' | 'FUNDING_FEE' | 'COMMISSION' | 'TRANSFER' | 'WELCOME_BONUS'
  income: string
  asset: string
  info: string
  time: number
  tranId: string
  tradeId: string
}

export interface CommissionRate {
  symbol: string
  makerCommissionRate: string
  takerCommissionRate: string
}
```

---

## Components Specification

### `StatCard.tsx`
Props: `label`, `value`, `sub`, `color: 'yellow'|'green'|'red'|'blue'|'orange'`, `valueColor?: 'pos'|'neg'|'neutral'|'accent'`

Renders a card with a 2px colored top border. Value is monospace, large. Sub-text is muted.

**8 stat cards in the top grid:**
| Label | Source | Color | Value Color |
|---|---|---|---|
| Wallet Balance | `totalWalletBalance` | yellow | neutral |
| Unrealized PnL | `totalUnrealizedProfit` | green | pos/neg |
| Available Margin | `availableBalance` | blue | neutral |
| Today's PnL | sum of today's `REALIZED_PNL` | green | pos/neg |
| Total Equity | `totalMarginBalance` | yellow | neutral |
| Open Positions | count of positions | blue | neutral |
| 30D Funding | sum of `fundingIncome` | red | pos/neg |
| 30D Commission | sum of `commissionIncome` | orange | neg |

---

### `Header.tsx`
- Left: diamond logo icon (clip-path polygon) + "FUTURES**DESK**"
- Right: green live dot + "live"/"disconnected" text + Refresh button + Logout button
- Refresh and Logout are hidden when disconnected, visible when connected
- Sticky top, backdrop blur, semi-transparent background

---

### `LoginModal.tsx`
- Fullscreen overlay with blur backdrop
- Centered card: logo, subtitle, API Key field (password type), Secret Key field (password type), Connect button
- On connect: save to sessionStorage, hide modal, call `refresh()`
- On error: show toast, stay on modal

---

### Tab: Overview
1. **Two-column row:**
   - Left: `PnlLineChart` with 7D/30D/90D period tabs. Cumulative PnL line, gradient fill. Green if positive, red if negative.
   - Right: `DistributionBarChart` — 4 metrics (Win Rate, Avg Win, Total Trades, Avg Loss) + bar chart of win/loss counts.

2. **`PnlCalendar`:** Monthly heatmap. Each cell = one day. Green background if daily PnL > 0, red if < 0, dark bg if no trades. Shows day number + short PnL amount. Nav arrows for prev/next month. Summary bar: Month PnL, Trade days, Win days, Loss days. Today cell has accent (yellow) border.

---

### Tab: Positions & Orders
1. **Open Positions table:** Symbol, Side (LONG/SHORT badge), Size, Entry Price, Mark Price, Liq. Price (red), Leverage, Margin, Unrealized PnL (pos/neg colored), ROE% (pos/neg colored)
2. **Open Orders table:** Time, Symbol, Side (BUY/SELL badge), Type, Qty, Price (or "Market"), Stop Price, Fill%, Status badge

---

### Tab: Income History
1. **Filter tabs:** All | Realized PnL | Funding Fee | Commission | Transfer
2. **Income table:** Time, Type (colored badge), Symbol, Amount (pos/neg), Asset, Info
3. **Two-column charts row:**
   - Left: `FundingLineChart` — cumulative funding fee over 30D
   - Right: `IncomeDonutChart` — breakdown of |PnL| vs |Funding| vs |Commission| with legend

---

### Tab: Trade Journal
- Period filter: Today | 7D | 30D
- Table: Time, Symbol, Realized PnL (pos/neg), Type
- "Today's PnL" stat card updates to match selected period

---

### Tab: Account
1. **Fee Info row** (4 tiles): VIP Tier, Maker Rate, Taker Rate, BNB Discount
2. **Two-column row:**
   - Left: Margin Health card — Initial Margin, Maint. Margin, Open Order Margin, Margin Ratio + animated health bar (green→orange→red based on usage %)
   - Right: Account Info card — Cross Wallet Balance, Max Withdraw, Multi-Assets Mode, Can Trade

---

## Format Utilities — `lib/format.ts`

```ts
export const fmt = (n: string | number, dec = 2) =>
  (parseFloat(String(n)) || 0).toFixed(dec)

export const fmtSign = (n: string | number, dec = 2) => {
  const v = parseFloat(String(n)) || 0
  return (v >= 0 ? '+' : '') + v.toFixed(dec)
}

export const fmtTime = (ts: number) => {
  const d = new Date(ts)
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export const fmtCompact = (n: number) => {
  const abs = Math.abs(n)
  const sign = n >= 0 ? '+' : '-'
  if (abs >= 1000) return sign + (abs / 1000).toFixed(1) + 'k'
  return sign + abs.toFixed(1)
}
```

---

## Refresh Behavior

- **First load:** Show full-page loader, render all components with fade-up animation
- **Subsequent refreshes** (auto every 30s or manual): Update data in-place, no loader, no component re-mount flicker
- **On error:** Clear session, show login modal, show error toast

---

## Responsive Breakpoints

- `< 640px`: Single column stats (2 per row), no horizontal scroll on tables (use table-scroll wrapper)
- `640–1000px`: Two-column charts become single column
- `> 1000px`: Full three/four column layouts

---

## Color Logic

| Condition | Color |
|---|---|
| PnL / value > 0 | `green` (#0ecb81) |
| PnL / value < 0 | `red` (#f6465d) |
| Liquidation price | always `red` |
| Funding fee | `orange` (#f77f00) |
| Margin ratio > 80% | `red` |
| Margin ratio 50–80% | `orange` |
| Margin ratio < 50% | `green` |
| LONG badge | green bg, green text |
| SHORT badge | red bg, red text |
| BUY badge | green bg, green text |
| SELL badge | red bg, red text |
| Active tab / accent | `#f0b90b` |
| Live status dot | green with glow |

---

## Environment Variables

```env
# Optional: for single-user/server-side-only mode
# If set, skip sending keys from client entirely
BINANCE_API_KEY=your_api_key
BINANCE_API_SECRET=your_api_secret
```

If using env vars, the API route reads from `process.env` instead of the request body.
Multi-user mode: always pass keys from client through the API route (never expose secret to browser).

---

## Notes

- All Binance Futures endpoints use base URL: `https://fapi.binance.com`
- HMAC-SHA256 signature uses the full query string (including `timestamp` and `recvWindow`)
- `recvWindow: 6000` is safe for most connections
- `/fapi/v1/commissionRate` requires a `symbol` param — use `BTCUSDT` as default; actual rates are account-level
- Income endpoint returns max 1000 records per call; for full history add pagination with `startTime`/`endTime`
- Positions with `positionAmt === "0"` should be filtered out (API returns all symbols)
- ROE% formula: `((markPrice - entryPrice) / entryPrice) * leverage * 100 * (side === 'LONG' ? 1 : -1)`