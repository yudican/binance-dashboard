'use client'

import { useEffect, useRef, useState } from 'react'

const WS_BASE = 'wss://fstream.binance.com'

/**
 * Public Binance Futures mark-price stream — no API key, read-only.
 * Returns a live `pair -> markPrice` map for the given pairs.
 */
export function useMarkPrices(pairs: string[]): Record<string, number> {
  const [marks, setMarks] = useState<Record<string, number>>({})

  const key = Array.from(new Set(pairs.map((p) => p.toUpperCase())))
    .sort()
    .join(',')

  const wsRef = useRef<WebSocket | null>(null)
  const reconnect = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closed = useRef(false)

  useEffect(() => {
    closed.current = false
    if (!key) {
      setMarks({})
      return
    }

    const streams = key
      .split(',')
      .map((s) => `${s.toLowerCase()}@markPrice@1s`)
      .join('/')

    const connect = () => {
      if (closed.current) return
      const ws = new WebSocket(`${WS_BASE}/stream?streams=${streams}`)
      wsRef.current = ws

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data)
          const d = msg?.data
          if (d?.e === 'markPriceUpdate' && d.s && d.p) {
            setMarks((prev) => ({ ...prev, [d.s]: parseFloat(d.p) }))
          }
        } catch {
          /* ignore */
        }
      }
      ws.onclose = () => {
        if (closed.current) return
        reconnect.current = setTimeout(connect, 2500)
      }
      ws.onerror = () => ws.close()
    }

    connect()

    return () => {
      closed.current = true
      if (reconnect.current) clearTimeout(reconnect.current)
      if (wsRef.current) {
        wsRef.current.onclose = null
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [key])

  return marks
}
