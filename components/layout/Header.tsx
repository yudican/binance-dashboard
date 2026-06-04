'use client'

import { Gem, LogOut, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Props {
  connected: boolean
  /** websocket streaming active */
  live?: boolean
  refreshing: boolean
  lastUpdated: Date | null
  onRefresh: () => void
  onLogout: () => void
}

function formatRelative(d: Date | null) {
  if (!d) return '—'
  const secs = Math.floor((Date.now() - d.getTime()) / 1000)
  if (secs < 5) return 'just now'
  if (secs < 60) return `${secs}s ago`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function Header({ connected, live, refreshing, lastUpdated, onRefresh, onLogout }: Props) {
  return (
    <header className="flex flex-col gap-3 rounded-2xl border bg-black/40 p-3 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <div className="orange-glow grid h-11 w-11 place-items-center rounded-xl border border-primary/70 bg-primary/10 text-primary">
          <Gem className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-wide sm:text-lg">
            FUTURES<span className="text-primary">DESK</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            {connected ? `Last sync ${formatRelative(lastUpdated)}` : 'Binance USDT-M Futures'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        <Badge
          className={`h-10 gap-2 px-3 ${
            live
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : connected
              ? 'border-primary/30 bg-primary/10 text-primary'
              : 'border-border bg-muted/40 text-muted-foreground'
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              live
                ? 'bg-emerald-400 shadow-[0_0_16px_#34d399] animate-pulseDot'
                : connected
                ? 'bg-primary'
                : 'bg-muted-foreground'
            }`}
          />
          {live ? 'Live · WebSocket' : connected ? 'Polling' : 'Disconnected'}
        </Badge>

        {connected && (
          <>
            <Button variant="outline" size="icon" onClick={onRefresh} disabled={refreshing} title="Refresh now">
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline" size="icon" onClick={onLogout} title="Logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </header>
  )
}
