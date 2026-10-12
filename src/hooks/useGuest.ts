'use client'

import { useState, useEffect, useCallback } from 'react'
import type { GuestSession } from '@/types/database'

const GUEST_KEY = 'lorena_guest_session'

function generateSessionToken(): string {
  const arr = new Uint8Array(24)
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(arr)
  } else {
    for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256)
  }
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('')
}

export function useGuest() {
  const [guest, setGuestState] = useState<GuestSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(GUEST_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as GuestSession
        if (parsed.name && parsed.sessionToken) {
          setGuestState(parsed)
        }
      }
    } catch {
      // ignore parse errors
    }
    setIsLoading(false)
  }, [])

  const setGuest = useCallback((name: string) => {
    const session: GuestSession = {
      name: name.trim(),
      sessionToken: generateSessionToken(),
      createdAt: new Date().toISOString(),
    }
    try {
      sessionStorage.setItem(GUEST_KEY, JSON.stringify(session))
    } catch {
      // Storage might be blocked
    }
    setGuestState(session)
    return session
  }, [])

  const clearGuest = useCallback(() => {
    try {
      sessionStorage.removeItem(GUEST_KEY)
    } catch {
      // ignore
    }
    setGuestState(null)
  }, [])

  return { guest, setGuest, clearGuest, isLoading }
}
