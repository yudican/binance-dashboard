'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { binanceFetch } from '@/lib/binance'
import { daysAgo, num } from '@/lib/format'
import type {
  AccountInfo,
  CommissionRate,
  IncomeRecord,
  Order,
  Position,
} from '@/types/binance'

export interface BinanceState {
  account: AccountInfo | null
  positions: Position[]
  openOrders: Order[]
  pnlIncome: IncomeRecord[]
  fundingIncome: IncomeRecord[]
  commissionIncome: IncomeRecord[]
  allIncome: IncomeRecord[]
  commissionRate: CommissionRate | null
}

const emptyState: BinanceState = {
  account: null,
  positions: [],
  openOrders: [],
  pnlIncome: [],
  fundingIncome: [],
  commissionIncome: [],
  allIncome: [],
  commissionRate: null,
}

export interface UseBinanceResult extends BinanceState {
  loading: boolean
  refreshing: boolean
  error: string | null
  lastUpdated: Date | null
  refresh: () => Promise<void>
}

export function useBinance(
  creds: { apiKey: string; apiSecret: string } | null,
  onAuthFail?: (msg: string) => void
): UseBinanceResult {
  const [data, setData] = useState<BinanceState>(emptyState)
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const hasLoadedOnce = useRef<boolean>(false)
  const inFlight = useRef<boolean>(false)

  const refresh = useCallback(async () => {
    if (!creds?.apiKey || !creds?.apiSecret) return
    if (inFlight.current) return
    inFlight.current = true

    if (!hasLoadedOnce.current) setLoading(true)
    else setRefreshing(true)
    setError(null)

    const { apiKey, apiSecret } = creds
    const startMonth = daysAgo(30)

    try {
      const [
        account,
        positionRisk,
        openOrders,
        pnlIncome,
        fundingIncome,
        commissionIncome,
        allIncome,
        commissionRate,
      ] = await Promise.all([
        binanceFetch<AccountInfo>('/fapi/v2/account', {}, apiKey, apiSecret),
        binanceFetch<Position[]>('/fapi/v2/positionRisk', {}, apiKey, apiSecret),
        binanceFetch<Order[]>('/fapi/v1/openOrders', {}, apiKey, apiSecret),
        binanceFetch<IncomeRecord[]>(
          '/fapi/v1/income',
          { incomeType: 'REALIZED_PNL', limit: 1000 },
          apiKey,
          apiSecret
        ),
        binanceFetch<IncomeRecord[]>(
          '/fapi/v1/income',
          { incomeType: 'FUNDING_FEE', limit: 1000, startTime: startMonth },
          apiKey,
          apiSecret
        ),
        binanceFetch<IncomeRecord[]>(
          '/fapi/v1/income',
          { incomeType: 'COMMISSION', limit: 1000, startTime: startMonth },
          apiKey,
          apiSecret
        ),
        binanceFetch<IncomeRecord[]>(
          '/fapi/v1/income',
          { limit: 1000 },
          apiKey,
          apiSecret
        ),
        binanceFetch<CommissionRate>(
          '/fapi/v1/commissionRate',
          { symbol: 'BTCUSDT' },
          apiKey,
          apiSecret
        ),
      ])

      const filteredPositions = (positionRisk || []).filter(
        (p) => num(p.positionAmt) !== 0
      )

      setData({
        account: account ?? null,
        positions: filteredPositions,
        openOrders: openOrders || [],
        pnlIncome: pnlIncome || [],
        fundingIncome: fundingIncome || [],
        commissionIncome: commissionIncome || [],
        allIncome: allIncome || [],
        commissionRate: commissionRate ?? null,
      })
      setLastUpdated(new Date())
      hasLoadedOnce.current = true
    } catch (e: any) {
      const msg = e?.message || 'Unknown error fetching Binance data'
      setError(msg)
      if (
        /API|key|signature|permission|recvWindow|Invalid|unauthorized/i.test(msg) &&
        onAuthFail
      ) {
        onAuthFail(msg)
      }
    } finally {
      inFlight.current = false
      setLoading(false)
      setRefreshing(false)
    }
  }, [creds, onAuthFail])

  // Initial fetch when credentials become available
  useEffect(() => {
    if (creds?.apiKey && creds?.apiSecret) {
      hasLoadedOnce.current = false
      refresh()
    } else {
      setData(emptyState)
      setLoading(false)
      setLastUpdated(null)
      hasLoadedOnce.current = false
    }
  }, [creds?.apiKey, creds?.apiSecret, refresh])

  // Auto-refresh every 30s
  useEffect(() => {
    if (!creds?.apiKey || !creds?.apiSecret) return
    const id = setInterval(() => {
      refresh()
    }, 30_000)
    return () => clearInterval(id)
  }, [creds?.apiKey, creds?.apiSecret, refresh])

  return {
    ...data,
    loading,
    refreshing,
    error,
    lastUpdated,
    refresh,
  }
}
