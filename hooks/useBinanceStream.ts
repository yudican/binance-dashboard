'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { binanceFetch } from '@/lib/binance'

const WS_BASE = 'wss://fstream.binance.com'

interface StreamArgs {
  apiKey: string
  apiSecret: string
  /** Symbols to subscribe to for live mark price (held positions). */
  symbols: string[]
  /** Called (debounced) when a user-data event indicates state changed. */
  onUserData?: () => void
}

export interface StreamResult {
  /** symbol -> latest mark price */
  marks: Record<string, number>
  /** true when at least one socket is open */
  connected: boolean
}

/**
 * Two Binance Futures websockets:
 *  - public mark price (<symbol>@markPrice@1s) for realtime unrealized PnL
 *  - private user-data stream (listenKey) to trigger refresh on fills /
 *    account / order updates
 */
export function useBinanceStream({
  apiKey,
  apiSecret,
  symbols,
  onUserData,
}: StreamArgs): StreamResult {
  const [marks, setMarks] = useState<Record<string, number>>({})
  const [connected, setConnected] = useState(false)

  const markWs = useRef<WebSocket | null>(null)
  const userWs = useRef<WebSocket | null>(null)
  const listenKey = useRef<string | null>(null)
  const keepAlive = useRef<ReturnType<typeof setInterval> | null>(null)
  const reconnectMark = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reconnectUser = useRef<ReturnType<typeof setTimeout> | null>(null)
  const debounceUser = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closed = useRef(false)

  const symbolsKey = symbols.slice().sort().join(',')

  const fireUserData = useCallback(() => {
    if (!onUserData) return
    if (debounceUser.current) clearTimeout(debounceUser.current)
    debounceUser.current = setTimeout(() => onUserData(), 800)
  }, [onUserData])

  /* ---- Mark price stream (public) ---- */
  useEffect(() => {
    closed.current = false
    if (!symbolsKey) {
      // nothing to subscribe to
      if (markWs.current) {
        markWs.current.close()
        markWs.current = null
      }
      return
    }

    const streams = symbolsKey
      .split(',')
      .map((s) => `${s.toLowerCase()}@markPrice@1s`)
      .join('/')

    const connect = () => {
      if (closed.current) return
      const ws = new WebSocket(`${WS_BASE}/stream?streams=${streams}`)
      markWs.current = ws

      ws.onopen = () => setConnected(true)
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
        reconnectMark.current = setTimeout(connect, 2500)
      }
      ws.onerror = () => ws.close()
    }

    connect()

    return () => {
      if (reconnectMark.current) clearTimeout(reconnectMark.current)
      if (markWs.current) {
        markWs.current.onclose = null
        markWs.current.close()
        markWs.current = null
      }
    }
  }, [symbolsKey])

  /* ---- User data stream (private, listenKey) ---- */
  useEffect(() => {
    closed.current = false
    if (!apiKey || !apiSecret) return

    let cancelled = false

    const openUserStream = async () => {
      try {
        const res = await binanceFetch<{ listenKey: string }>(
          '/fapi/v1/listenKey',
          {},
          apiKey,
          apiSecret,
          { method: 'POST', signed: false }
        )
        if (cancelled || !res?.listenKey) return
        listenKey.current = res.listenKey

        const connect = () => {
          if (closed.current || cancelled) return
          const ws = new WebSocket(`${WS_BASE}/ws/${listenKey.current}`)
          userWs.current = ws

          ws.onopen = () => setConnected(true)
          ws.onmessage = (ev) => {
            try {
              const d = JSON.parse(ev.data)
              if (
                d?.e === 'ACCOUNT_UPDATE' ||
                d?.e === 'ORDER_TRADE_UPDATE' ||
                d?.e === 'ACCOUNT_CONFIG_UPDATE'
              ) {
                fireUserData()
              }
            } catch {
              /* ignore */
            }
          }
          ws.onclose = () => {
            if (closed.current || cancelled) return
            reconnectUser.current = setTimeout(connect, 2500)
          }
          ws.onerror = () => ws.close()
        }
        connect()

        // Keepalive every 30 min (listenKey expires after 60)
        keepAlive.current = setInterval(() => {
          binanceFetch('/fapi/v1/listenKey', {}, apiKey, apiSecret, {
            method: 'PUT',
            signed: false,
          }).catch(() => {})
        }, 30 * 60 * 1000)
      } catch {
        // listenKey failed (e.g. key lacks permission) — silent; REST polling still works
      }
    }

    openUserStream()

    return () => {
      cancelled = true
      if (keepAlive.current) clearInterval(keepAlive.current)
      if (reconnectUser.current) clearTimeout(reconnectUser.current)
      if (userWs.current) {
        userWs.current.onclose = null
        userWs.current.close()
        userWs.current = null
      }
      // best-effort close of listenKey
      if (listenKey.current) {
        binanceFetch('/fapi/v1/listenKey', {}, apiKey, apiSecret, {
          method: 'DELETE',
          signed: false,
        }).catch(() => {})
        listenKey.current = null
      }
    }
  }, [apiKey, apiSecret, fireUserData])

  // mark fully closed on unmount
  useEffect(() => {
    return () => {
      closed.current = true
      setConnected(false)
    }
  }, [])

  return { marks, connected }
}
