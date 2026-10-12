import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

const PAGE_SIZE = 20

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug') || 'lorena-rayla-xv'
  const page = Math.max(0, parseInt(searchParams.get('page') || '0'))
  const limit = Math.min(50, parseInt(searchParams.get('limit') || String(PAGE_SIZE)))
  const type = searchParams.get('type') // 'photo' | 'video' | null
  const uploaderSearch = searchParams.get('uploader') || null // busca por nome
  const sortBy = searchParams.get('sort') || 'newest' // 'newest' | 'most_liked'

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
    .select('id, uploader_name, media_type, original_filename, file_size, mime_type, likes_count, caption, created_at, storage_path, thumbnail_path')
    .eq('event_id', event.id)
    .eq('moderation_status', 'approved')
    .range(page * limit, (page + 1) * limit - 1)

  // Sort
  if (sortBy === 'most_liked') {
    query = query.order('likes_count', { ascending: false }).order('created_at', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  if (type === 'photo' || type === 'video') {
    query = query.eq('media_type', type)
  }

  if (uploaderSearch) {
    query = query.ilike('uploader_name', `%${uploaderSearch}%`)
  }

  const { data: media, error } = await query

  if (error) {
    console.error('Media query error:', error)
    return NextResponse.json({ error: 'Erro ao buscar mídias.' }, { status: 500 })
  }

  // When filtering, also return how many approved items exist in total (all types)
  // so the client can show appropriate empty states
  let total_approved = (media || []).length
  if (type && (media || []).length === 0) {
    const { count } = await supabaseAdmin
      .from('media')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', event.id)
      .eq('moderation_status', 'approved')
    total_approved = count ?? 0
  }

  return NextResponse.json({ media: media || [], total_approved })
}
