'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Gem } from 'lucide-react'
import Header from '@/components/layout/Header'
import LoginModal from '@/components/auth/LoginModal'
import Dashboard from '@/components/dashboard/Dashboard'
import { useSession } from '@/hooks/useSession'
import { useBinance } from '@/hooks/useBinance'
import { useBinanceStream } from '@/hooks/useBinanceStream'

interface Toast {
  id: number
  message: string
}

export default function Page() {
  const { ready, authed, get, set, clear } = useSession()
  const [creds, setCreds] = useState<{ apiKey: string; apiSecret: string } | null>(null)
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [loginError, setLoginError] = useState<string | null>(null)
  const firstLoadDone = useRef<boolean>(false)

  const pushToast = useCallback((message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 9999)
    setToasts((prev) => [...prev, { id, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4500)
  }, [])

  const handleAuthFail = useCallback(
    (msg: string) => {
      clear()
      setCreds(null)
      setModalOpen(true)
      setLoginError(msg)
      pushToast(msg)
    },
    [clear, pushToast]
  )

  const {
    account,
    positions,
    openOrders,
    pnlIncome,
    fundingIncome,
    commissionIncome,
    allIncome,
    commissionRate,
    loading,
    refreshing,
    error,
    lastUpdated,
    refresh,
  } = useBinance(creds, handleAuthFail)

  // Bootstrap from sessionStorage once
  useEffect(() => {
    if (!ready) return
    if (authed) {
      const c = get()
      if (c.apiKey && c.apiSecret) {
        setCreds(c)
        setModalOpen(false)
        return
      }
    }
    setModalOpen(true)
  }, [ready, authed, get])

  // Surface fetch errors as toasts (but only when we have creds)
  useEffect(() => {
    if (error && creds) pushToast(error)
  }, [error, creds, pushToast])

  // Mark first-load as done once we have data
  useEffect(() => {
    if (!loading && account) firstLoadDone.current = true
  }, [loading, account])

  // ---- Realtime websocket layer ----
  const symbols = useMemo(() => positions.map((p) => p.symbol), [positions])
  const { marks, connected: wsConnected } = useBinanceStream({
    apiKey: creds?.apiKey || '',
    apiSecret: creds?.apiSecret || '',
    symbols,
    onUserData: refresh,
  })

  const handleLogin = async (apiKey: string, apiSecret: string) => {
    setLoginError(null)
    set(apiKey, apiSecret)
    setCreds({ apiKey, apiSecret })
    setModalOpen(false)
    firstLoadDone.current = false
  }

  const handleLogout = () => {
    clear()
    setCreds(null)
    setModalOpen(true)
    setLoginError(null)
  }

  const connected = !!creds && !!account && !loading

  return (
    <>
      <main className="relative z-10 mx-auto min-h-screen max-w-[1400px] space-y-4 p-3 sm:p-4 lg:p-6">
        <Header
          connected={connected}
          live={connected && wsConnected}
          refreshing={refreshing}
          lastUpdated={lastUpdated}
          onRefresh={refresh}
          onLogout={handleLogout}
        />

        {/* Full-page spinner only on the very first load while authed */}
        {creds && loading && !firstLoadDone.current ? (
          <FullPageLoader />
        ) : creds ? (
          <Dashboard
            account={account}
            positions={positions}
            openOrders={openOrders}
            pnlIncome={pnlIncome}
            fundingIncome={fundingIncome}
            commissionIncome={commissionIncome}
            allIncome={allIncome}
            commissionRate={commissionRate}
            firstLoad={!firstLoadDone.current}
            marks={marks}
          />
        ) : (
          <DisconnectedState />
        )}
      </main>

      <LoginModal open={modalOpen} onSubmit={handleLogin} errorMessage={loginError} />

      <div className="fixed bottom-6 right-6 z-[60] space-y-2">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            {t.message}
          </div>
        ))}
      </div>
    </>
  )
}

function FullPageLoader() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
      <div
        className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent"
        aria-label="Loading"
      />
      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
        Fetching futures data…
      </div>
    </div>
  )
}

function DisconnectedState() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <div className="orange-glow mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl border border-primary/70 bg-primary/10 text-primary">
          <Gem className="h-6 w-6" />
        </div>
        <div className="text-[15px] font-semibold tracking-[0.12em]">
          FUTURES<span className="text-primary">DESK</span>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">Connect to begin.</div>
      </div>
    </div>
  )
}
