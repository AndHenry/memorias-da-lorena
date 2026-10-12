import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'
import { NextRequest } from 'next/server'
import { supabaseAdmin } from './admin'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server component — can be ignored
          }
        },
      },
    }
  )
}

/**
 * Validates the admin user from either:
 * 1. Authorization header (Bearer <token>)
 * 2. Next.js cookies via createServerSupabaseClient
 */
export async function getAdminUser(request?: NextRequest) {
  // 1. Try checking Authorization header
  if (request) {
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      try {
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
        if (!error && user) return user
      } catch (err) {
        console.warn('Bearer token validation failed:', err)
      }
    }
  }

  // 2. Try checking session cookies
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) return user
  } catch (err) {
    console.warn('Cookie session validation failed:', err)
  }

  return null
}
