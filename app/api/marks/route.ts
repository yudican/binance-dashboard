import { NextRequest } from 'next/server'
import { normalizePair } from '@/lib/signals'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BINANCE_WS = 'wss://fstream.binance.com'
const BYBIT_WS = 'wss://stream.bybit.com/v5/public/linear'

const SSE_HEADERS = {
  'Content-Type': 'text/event-stream; charset=utf-8',
  'Cache-Control': 'no-cache, no-transform',
  Connection: 'keep-alive',
}

interface SourceOpts {
  symbols: string[]
  onPrice: (symbol: string, price: number) => void
  /** Called once when this source gives up (error / silent / closed). */
  onDead: () => void
}

interface Source {
  stop: () => void
}

/** Binance USDT-M mark price (preferred; blocked in some regions). */
function binanceSource({ symbols, onPrice, onDead }: SourceOpts): Source {
  const streams = symbols.map((s) => `${s.toLowerCase()}@markPrice@1s`).join('/')
  const ws = new WebSocket(`${BINANCE_WS}/stream?streams=${streams}`)
  let dead = false
  // No data within 5s => treat as blocked and fall back.
  let silent: ReturnType<typeof setTimeout> | null = setTimeout(die, 5000)

  function die() {
    if (dead) return
    dead = true
    if (silent) clearTimeout(silent)
    try {
      ws.onclose = null
      ws.close()
    } catch {
      /* noop */
    }
    onDead()
  }

  ws.onmessage = (ev) => {
    if (silent) {
      clearTimeout(silent)
      silent = null
    }
    try {
      const d = JSON.parse(typeof ev.data === 'string' ? ev.data : '')?.data
      if (d?.e === 'markPriceUpdate' && d.s && d.p) onPrice(String(d.s), parseFloat(d.p))
    } catch {
      /* ignore */
    }
  }
  ws.onclose = () => die()
  ws.onerror = () => {
    try {
      ws.close()
    } catch {
      /* noop */
    }
  }

  return {
    stop() {
      dead = true
      if (silent) clearTimeout(silent)
      try {
        ws.onclose = null
        ws.close()
      } catch {
        /* noop */
      }
    },
  }
}

/** Bybit linear ticker fallback (mark price; reachable where Binance is blocked). */
function bybitSource({ symbols, onPrice, onDead }: SourceOpts): Source {
  const ws = new WebSocket(BYBIT_WS)
  let dead = false
  let ping: ReturnType<typeof setInterval> | null = null
  let silent: ReturnType<typeof setTimeout> | null = setTimeout(die, 6000)

  function die() {
    if (dead) return
    dead = true
    if (silent) clearTimeout(silent)
    if (ping) clearInterval(ping)
    try {
      ws.onclose = null
      ws.close()
    } catch {
      /* noop */
    }
    onDead()
  }

  ws.onopen = () => {
    ws.send(JSON.stringify({ op: 'subscribe', args: symbols.map((s) => `tickers.${s}`) }))
    ping = setInterval(() => {
      try {
        ws.send(JSON.stringify({ op: 'ping' }))
      } catch {
        /* noop */
      }
    }, 18000)
  }
  ws.onmessage = (ev) => {
    try {
      const msg = JSON.parse(typeof ev.data === 'string' ? ev.data : '')
      const d = msg?.data
      if (!msg?.topic || !d?.symbol) return
      const raw = d.markPrice ?? d.lastPrice
      const p = parseFloat(raw)
      if (isFinite(p)) {
        if (silent) {
          clearTimeout(silent)
          silent = null
        }
        onPrice(String(d.symbol), p)
      }
    } catch {
      /* ignore */
    }
  }
  ws.onclose = () => die()
  ws.onerror = () => {
    try {
      ws.close()
    } catch {
      /* noop */
    }
  }

  return {
    stop() {
      dead = true
      if (silent) clearTimeout(silent)
      if (ping) clearInterval(ping)
      try {
        ws.onclose = null
        ws.close()
      } catch {
        /* noop */
      }
    },
  }
}

const SOURCES = [binanceSource, bybitSource]

/**
 * SSE proxy for live mark prices. The browser cannot reach the exchanges from
 * geo-blocked regions, so the server holds the upstream WebSocket and relays
 * each update as: `data: {"s":"BTCUSDT","p":63210.5}`. Tries Binance first,
 * then falls back to Bybit if Binance is unreachable/silent, cycling on death.
 *
 * GET /api/marks?symbols=BTCUSDT,ETHUSDT
 */
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('symbols') || ''
  const symbols = Array.from(new Set(raw.split(',').map(normalizePair).filter(Boolean)))
  if (!symbols.length) {
    return new Response('retry: 5000\n\n', { headers: SSE_HEADERS })
  }

  const encoder = new TextEncoder()
  let closed = false
  let current: Source | null = null
  let retry: ReturnType<typeof setTimeout> | null = null
  let ping: ReturnType<typeof setInterval> | null = null
  let idx = 0

  const stream = new ReadableStream({
    start(controller) {
      const send = (line: string) => {
        if (!closed) controller.enqueue(encoder.encode(line))
      }
      const onPrice = (symbol: string, price: number) =>
        send(`data: ${JSON.stringify({ s: symbol, p: price })}\n\n`)

      const startNext = () => {
        if (closed) return
        const factory = SOURCES[idx % SOURCES.length]
        idx++
        current = factory({
          symbols,
          onPrice,
          onDead: () => {
            current = null
            if (closed) return
            // Longer pause before re-trying the Binance head of the cycle.
            const nextIsHead = idx % SOURCES.length === 0
            retry = setTimeout(startNext, nextIsHead ? 3000 : 400)
          },
        })
      }

      startNext()
      ping = setInterval(() => send(': ping\n\n'), 15000)
    },
    cancel() {
      closed = true
      if (retry) clearTimeout(retry)
      if (ping) clearInterval(ping)
      current?.stop()
      current = null
    },
  })

  return new Response(stream, { headers: SSE_HEADERS })
}
