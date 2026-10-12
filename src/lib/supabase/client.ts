import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables are missing. Please configure .env.local')
}

export const supabase = createBrowserClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

/**
 * Helper to call internal API routes with the Supabase access token in Authorization header.
 * Ensures authentication works across cookies and bearer token validation.
 */
export async function authFetch(url: string, options: RequestInit = {}) {
  let token: string | undefined
  try {
    const sessionPromise = supabase.auth.getSession()
    const timeoutPromise = new Promise<{ data: { session: null } }>((resolve) =>
      setTimeout(() => resolve({ data: { session: null } }), 2000)
    )
    const result = await Promise.race([sessionPromise, timeoutPromise])
    token = result?.data?.session?.access_token
  } catch (err) {
    console.warn('Could not retrieve access token for authFetch:', err)
  }

  const headers = new Headers(options.headers || {})
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  return fetch(url, {
    ...options,
    headers,
  })
}
