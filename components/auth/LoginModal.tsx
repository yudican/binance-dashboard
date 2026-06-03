'use client'

import { useState, FormEvent } from 'react'

interface Props {
  open: boolean
  onSubmit: (apiKey: string, apiSecret: string) => Promise<void> | void
  errorMessage?: string | null
}

export default function LoginModal({ open, onSubmit, errorMessage }: Props) {
  const [apiKey, setApiKey] = useState('')
  const [apiSecret, setApiSecret] = useState('')
  const [busy, setBusy] = useState(false)
  const [localErr, setLocalErr] = useState<string | null>(null)

  if (!open) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLocalErr(null)
    if (!apiKey.trim() || !apiSecret.trim()) {
      setLocalErr('Both API Key and Secret are required.')
      return
    }
    setBusy(true)
    try {
      await onSubmit(apiKey.trim(), apiSecret.trim())
    } catch (err: any) {
      setLocalErr(err?.message || 'Connection failed')
    } finally {
      setBusy(false)
    }
  }

  const err = localErr || errorMessage

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{
        background: 'rgba(5, 7, 12, 0.78)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      <div className="card-base w-full max-w-md p-8 animate-fadeUp">
        <div className="flex items-center gap-3 mb-1">
          <div className="diamond-logo" />
          <div className="text-lg tracking-wide font-semibold">
            FUTURES<span className="text-accent">DESK</span>
          </div>
        </div>
        <p className="text-sm text-muted2 mb-6">
          Connect with a read-only Binance USDT-M Futures key. Your secret is signed
          server-side and never leaves your tab.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted2">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              placeholder="•••••••••••••••••••••••••••••••"
              className="mt-1.5 w-full rounded-lg bg-bg3 border border-strong/30 px-3.5 py-2.5 text-sm font-mono outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/40 transition"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted2">
              API Secret
            </label>
            <input
              type="password"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              placeholder="•••••••••••••••••••••••••••••••"
              className="mt-1.5 w-full rounded-lg bg-bg3 border border-strong/30 px-3.5 py-2.5 text-sm font-mono outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/40 transition"
            />
          </div>

          {err && (
            <div className="text-xs text-loss bg-loss/10 border border-loss/30 rounded-lg px-3 py-2">
              {err}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-accent text-black font-semibold py-2.5 text-sm tracking-wide hover:brightness-110 active:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {busy ? 'Connecting…' : 'Connect'}
          </button>
        </form>

        <div className="mt-5 text-[11px] leading-relaxed text-muted">
          Stored in <span className="font-mono text-muted2">sessionStorage</span> — cleared
          when this tab closes. Use a key with <span className="text-muted2">Read-Only</span> and{' '}
          <span className="text-muted2">Enable Futures</span> permissions.
        </div>
      </div>
    </div>
  )
}
