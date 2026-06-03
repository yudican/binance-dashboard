'use client'

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
  if (!d) return ''
  const secs = Math.floor((Date.now() - d.getTime()) / 1000)
  if (secs < 5) return 'just now'
  if (secs < 60) return `${secs}s ago`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function Header({ connected, live, refreshing, lastUpdated, onRefresh, onLogout }: Props) {
  return (
    <header
      className="sticky top-0 z-40 border-b border-soft/40"
      style={{
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        background: 'rgba(10, 12, 16, 0.72)',
      }}
    >
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 h-[60px] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="diamond-logo" />
          <div className="text-[15px] tracking-[0.12em] font-semibold">
            FUTURES<span className="text-accent">DESK</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                live
                  ? 'bg-gain animate-pulseDot'
                  : connected
                  ? 'bg-accent'
                  : 'bg-muted'
              }`}
            />
            <span className={live ? 'text-gain' : connected ? 'text-accent' : 'text-muted2'}>
              {live ? 'live' : connected ? 'polling' : 'disconnected'}
            </span>
            {connected && lastUpdated && (
              <span className="hidden sm:inline text-muted ml-2">· updated {formatRelative(lastUpdated)}</span>
            )}
          </div>

          {connected && (
            <>
              <button
                onClick={onRefresh}
                disabled={refreshing}
                title="Refresh now"
                className="flex items-center gap-1.5 rounded-lg border border-strong/30 bg-bg3 hover:bg-card2 px-3 py-1.5 text-xs transition disabled:opacity-60"
              >
                <svg
                  className={refreshing ? 'animate-spin' : ''}
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12a9 9 0 1 1-3-6.7" />
                  <path d="M21 3v6h-6" />
                </svg>
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={onLogout}
                title="Logout"
                className="rounded-lg border border-strong/30 bg-bg3 hover:bg-card2 px-3 py-1.5 text-xs transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
