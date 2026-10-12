import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

const PAGE_SIZE = 20

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug') || 'lorena-rayla-xv'
  const page = Math.max(0, parseInt(searchParams.get('page') || '0'))
  const limit = Math.min(50, parseInt(searchParams.get('limit') || String(PAGE_SIZE)))
  const type = searchParams.get('type') // 'photo' | 'video' | null

  // Get event
  const { data: event } = await supabaseAdmin
    .from('events')
    .select('id, gallery_visibility')
    .eq('slug', slug)
    .single()

  if (!event) {
    return NextResponse.json({ error: 'Evento não encontrado.' }, { status: 404 })
  }

  if (event.gallery_visibility === 'private' || event.gallery_visibility === 'closed') {
    return NextResponse.json({ error: 'private', media: [] }, { status: 403 })
  }

  // Query approved media
  let query = supabaseAdmin
    .from('media')
    .select('id, uploader_name, media_type, original_filename, file_size, mime_type, likes_count, created_at, storage_path, thumbnail_path')
    .eq('event_id', event.id)
    .eq('moderation_status', 'approved')
    .order('created_at', { ascending: false })
    .range(page * limit, (page + 1) * limit - 1)

  if (type === 'photo' || type === 'video') {
    query = query.eq('media_type', type)
  }

  const { data: media, error } = await query

  if (error) {
    console.error('Media query error:', error)
    return NextResponse.json({ error: 'Erro ao buscar mídias.' }, { status: 500 })
  }

  return NextResponse.json({ media: media || [] })
}
