import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// POST /api/admin/moderate
// Body: { mediaId, action: 'approve' | 'reject' | 'delete', adminId }
export async function POST(request: NextRequest) {
  const user = await getAdminUser(request)

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const body = await request.json()
  const { mediaId, action } = body as { mediaId: string; action: 'approve' | 'reject' | 'delete' }

  if (!mediaId || !['approve', 'reject', 'delete'].includes(action)) {
    return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 })
  }

  // Get the media item
  const { data: media } = await supabaseAdmin
    .from('media')
    .select('id, storage_path, thumbnail_path')
    .eq('id', mediaId)
    .single()

  if (!media) {
    return NextResponse.json({ error: 'Arquivo não encontrado.' }, { status: 404 })
  }

  if (action === 'delete') {
    // Delete from storage first
    const paths = [media.storage_path]
    if (media.thumbnail_path) paths.push(media.thumbnail_path)
    await supabaseAdmin.storage.from('media').remove(paths)

    // Delete from DB
    await supabaseAdmin.from('media').delete().eq('id', mediaId)
  } else {
    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    await supabaseAdmin
      .from('media')
      .update({ moderation_status: newStatus })
      .eq('id', mediaId)
  }

  // Audit log
  await supabaseAdmin.from('admin_audit_logs').insert({
    admin_id: user.id,
    action: `media_${action}`,
    target_id: mediaId,
    metadata: { action },
  })

  return NextResponse.json({ success: true })
}

// GET /api/admin/moderate — list pending/all media for moderation
export async function GET(request: NextRequest) {
  const user = await getAdminUser(request)

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug') || 'lorena-rayla-xv'
  const status = searchParams.get('status') || 'pending'
  const page = Math.max(0, parseInt(searchParams.get('page') || '0'))
  const limit = 30

  const { data: event } = await supabaseAdmin
    .from('events')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!event) return NextResponse.json({ error: 'Evento não encontrado.' }, { status: 404 })

  let query = supabaseAdmin
    .from('media')
    .select('*')
    .eq('event_id', event.id)
    .order('created_at', { ascending: false })
    .range(page * limit, (page + 1) * limit - 1)

  if (status !== 'all') {
    query = query.eq('moderation_status', status as any)
  }

  const { data: media, error } = await query
  if (error) return NextResponse.json({ error: 'Erro ao buscar mídias.' }, { status: 500 })

  const itemsWithUrls = await Promise.all(
    (media || []).map(async (item) => {
      const thumbPath = item.thumbnail_path || item.storage_path
      const { data: thumbData } = await supabaseAdmin.storage
        .from('media')
        .createSignedUrl(thumbPath, 60 * 60)
      const { data: fullData } = await supabaseAdmin.storage
        .from('media')
        .createSignedUrl(item.storage_path, 60 * 60)

      return {
        ...item,
        previewUrl: thumbData?.signedUrl || null,
        fullUrl: fullData?.signedUrl || null,
      }
    })
  )

  return NextResponse.json({ media: itemsWithUrls })
}
