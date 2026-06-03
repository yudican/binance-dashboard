'use client'

import { useCallback, useEffect, useState } from 'react'

const KEY = 'bn_k'
const SECRET = 'bn_s'

export interface SessionCreds {
  apiKey: string
  apiSecret: string
}

export function useSession() {
  const [authed, setAuthed] = useState<boolean>(false)
  const [ready, setReady] = useState<boolean>(false)

  useEffect(() => {
    try {
      const has = !!(sessionStorage.getItem(KEY) && sessionStorage.getItem(SECRET))
      setAuthed(has)
    } catch {
      setAuthed(false)
    }
    setReady(true)
  }, [])

  const get = useCallback((): SessionCreds => {
    if (typeof window === 'undefined') return { apiKey: '', apiSecret: '' }
    return {
      apiKey: sessionStorage.getItem(KEY) || '',
      apiSecret: sessionStorage.getItem(SECRET) || '',
    }
  }, [])

  const set = useCallback((apiKey: string, apiSecret: string) => {
    sessionStorage.setItem(KEY, apiKey)
    sessionStorage.setItem(SECRET, apiSecret)
    setAuthed(true)
  }, [])

  const clear = useCallback(() => {
    sessionStorage.removeItem(KEY)
    sessionStorage.removeItem(SECRET)
    setAuthed(false)
  }, [])

  return { ready, authed, get, set, clear }
}
