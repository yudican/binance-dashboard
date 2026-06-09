'use client'

import { useEffect, useState } from 'react'
import { normalizePair } from '@/lib/signals'

/**
 * Live `symbol -> markPrice` map. Subscribes to the server-side SSE proxy
 * (/api/marks), which holds the upstream Binance WebSocket — the browser
 * never connects to Binance directly (works from geo-blocked regions when
 * the server is hosted elsewhere). Keyed by bare exchange symbol (BTCUSDT).
 */
export function useMarkPrices(pairs: string[]): Record<string, number> {
  const [marks, setMarks] = useState<Record<string, number>>({})

  const key = Array.from(new Set(pairs.map(normalizePair).filter(Boolean)))
    .sort()
    .join(',')

  useEffect(() => {
    if (!key) {
      setMarks({})
      return
    }

    const es = new EventSource(`/api/marks?symbols=${encodeURIComponent(key)}`)
    es.onmessage = (ev) => {
      try {
        const d = JSON.parse(ev.data)
        if (d?.s && typeof d.p === 'number' && isFinite(d.p)) {
          setMarks((prev) => ({ ...prev, [d.s]: d.p }))
        }
      } catch {
        /* ignore */
      }
    }
    // EventSource reconnects automatically on transient errors.

    return () => es.close()
  }, [key])

  return marks
}
