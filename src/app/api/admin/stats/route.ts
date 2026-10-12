import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// GET /api/admin/stats
export async function GET(request: NextRequest) {
  const user = await getAdminUser(request)

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const slug = new URL(request.url).searchParams.get('slug') || 'lorena-rayla-xv'

  const { data: event } = await supabaseAdmin
    .from('events')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!event) {
    return NextResponse.json({ error: 'Evento não encontrado.' }, { status: 404 })
  }

  const [photos, videos, pending, guests, storageItems] = await Promise.all([
    supabaseAdmin.from('media').select('id', { count: 'exact', head: true }).eq('event_id', event.id).eq('media_type', 'photo'),
    supabaseAdmin.from('media').select('id', { count: 'exact', head: true }).eq('event_id', event.id).eq('media_type', 'video'),
    supabaseAdmin.from('media').select('id', { count: 'exact', head: true }).eq('event_id', event.id).eq('moderation_status', 'pending'),
    supabaseAdmin.from('media').select('uploader_name').eq('event_id', event.id),
    supabaseAdmin.from('media').select('file_size').eq('event_id', event.id),
  ])

  const uniqueGuests = new Set(guests.data?.map((m) => m.uploader_name) || []).size
  const storageBytes = (storageItems.data || []).reduce((sum, m) => sum + (m.file_size || 0), 0)

  return NextResponse.json({
    stats: {
      total_photos: photos.count || 0,
      total_videos: videos.count || 0,
      total_uploads: (photos.count || 0) + (videos.count || 0),
      total_guests: uniqueGuests,
      pending_moderation: pending.count || 0,
      storage_used_bytes: storageBytes,
    },
  })
}
