'use client'

import { useState, FormEvent } from 'react'
import { Gem } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-xl">
      <div className="terminal-panel w-full max-w-md rounded-2xl p-8">
        <div className="mb-1 flex items-center gap-3">
          <div className="orange-glow flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
            <Gem className="h-5 w-5 text-primary" />
          </div>
          <div className="text-lg font-semibold tracking-wide">
            FUTURES<span className="text-primary">DESK</span>
          </div>
        </div>
        <p className="mb-6 text-sm text-muted-foreground">
          Connect with a read-only Binance USDT-M Futures key. Your secret is signed
          server-side and never leaves your tab.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              placeholder="•••••••••••••••••••••••••••••••"
              className="mt-1.5 w-full rounded-lg border border-border bg-background/60 px-3.5 py-2.5 font-mono text-sm outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              API Secret
            </label>
            <input
              type="password"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              placeholder="•••••••••••••••••••••••••••••••"
              className="mt-1.5 w-full rounded-lg border border-border bg-background/60 px-3.5 py-2.5 font-mono text-sm outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/40"
            />
          </div>

          {err && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {err}
            </div>
          )}

          <Button type="submit" disabled={busy} className="w-full">
            {busy ? 'Connecting…' : 'Connect'}
          </Button>
        </form>

        <div className="mt-5 text-[11px] leading-relaxed text-muted-foreground">
          Stored in <span className="font-mono">sessionStorage</span> — cleared
          when this tab closes. Use a key with <span className="text-foreground">Read-Only</span> and{' '}
          <span className="text-foreground">Enable Futures</span> permissions.
        </div>
      </div>
    </div>
  )
}
