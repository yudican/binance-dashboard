'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Header from '@/components/layout/Header'
import LoginModal from '@/components/auth/LoginModal'
import Dashboard from '@/components/dashboard/Dashboard'
import { useSession } from '@/hooks/useSession'
import { useBinance } from '@/hooks/useBinance'

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
      <Header
        connected={connected}
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
        />
      ) : (
        <DisconnectedState />
      )}

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
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
      <div
        className="w-9 h-9 border-2 border-accent border-t-transparent rounded-full animate-spin"
        aria-label="Loading"
      />
      <div className="text-xs uppercase tracking-[0.18em] text-muted2">
        Fetching futures data…
      </div>
    </div>
  )
}

function DisconnectedState() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="diamond-logo mx-auto mb-4" />
        <div className="text-[15px] tracking-[0.12em] font-semibold">
          FUTURES<span className="text-accent">DESK</span>
        </div>
        <div className="text-xs text-muted2 mt-1">Connect to begin.</div>
      </div>
    </div>
  )
}
