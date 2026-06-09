'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { liveStatus, normalizePair, type Signal } from '@/lib/signals'

/**
 * Watches live prices against signals and persists progress to the store when
 * a new target is reached or the stop is hit. Server is idempotent (targetsHit
 * only grows, status flips to closed once), so duplicate fires are harmless.
 * On any persisted change it calls router.refresh() to pull fresh server data.
 */
export function useSignalProgressSync(signals: Signal[], marks: Record<string, number>) {
  const router = useRouter()
  const inflight = useRef<Set<string>>(new Set())

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      let didChange = false

      for (const s of signals) {
        if (s.status === 'closed' || s.side === 'WATCH') continue
        if (inflight.current.has(s.id)) continue

        const price = marks[normalizePair(s.pair)]
        const live = liveStatus(s, price)
        if (!live) continue

        const newTp = live.tpHitCount > s.targetsHit
        const newStop = live.stopHit
        if (!newTp && !newStop) continue

        inflight.current.add(s.id)
        try {
          const res = await fetch('/api/signals', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: s.id, targetsHit: live.tpHitCount, stopHit: newStop }),
          })
          if (res.ok) didChange = true
        } catch {
          /* ignore — will retry on next price tick */
        } finally {
          inflight.current.delete(s.id)
        }
      }

      if (didChange && !cancelled) router.refresh()
    }

    run()
    return () => {
      cancelled = true
    }
  }, [signals, marks, router])
}
