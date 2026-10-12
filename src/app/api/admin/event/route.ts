import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// GET /api/admin/event — get event config
export async function GET(request: NextRequest) {
  try {
    const user = await getAdminUser(request)
    if (!user) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })

    const slug = new URL(request.url).searchParams.get('slug') || 'lorena-rayla-xv'
    const { data: event, error } = await supabaseAdmin.from('events').select('*').eq('slug', slug).single()
    if (error || !event) return NextResponse.json({ error: 'Evento não encontrado.' }, { status: 404 })

    return NextResponse.json({ event })
  } catch (err) {
    console.error('Error in GET /api/admin/event:', err)
    return NextResponse.json({ error: 'Erro interno ao buscar configurações.' }, { status: 500 })
  }
}

// PATCH /api/admin/event — update event config
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAdminUser(request)
    if (!user) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })

    const body = await request.json()
    const { slug = 'lorena-rayla-xv', ...updates } = body

    // Whitelist allowed fields
    const allowed = [
      'title', 'description', 'upload_enabled', 'gallery_visibility',
      'moderation_enabled', 'downloads_enabled', 'max_file_size_mb',
      'max_video_size_mb', 'max_files_per_upload', 'status', 'upload_closed_message',
    ]
    const safeUpdates = Object.fromEntries(Object.entries(updates).filter(([k]) => allowed.includes(k)))

    const { data: event, error } = await supabaseAdmin
      .from('events')
      .update(safeUpdates as any)
      .eq('slug', slug)
      .select()
      .single()

    if (error) {
      console.error('Update error in PATCH /api/admin/event:', error)
      return NextResponse.json({ error: 'Erro ao atualizar evento.' }, { status: 500 })
    }

    // Audit log (non-blocking)
    Promise.resolve(
      supabaseAdmin.from('admin_audit_logs').insert({
        admin_id: user.id,
        action: 'event_update',
        metadata: safeUpdates as any,
      })
    ).catch((e: unknown) => console.warn('Audit log error:', e))

    return NextResponse.json({ event })
  } catch (err) {
    console.error('Error in PATCH /api/admin/event:', err)
    return NextResponse.json({ error: 'Erro interno ao salvar configurações.' }, { status: 500 })
  }
}
