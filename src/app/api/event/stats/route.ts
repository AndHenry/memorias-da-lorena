import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// GET /api/event/stats — public stats for the home page
export async function GET(request: NextRequest) {
  const slug = new URL(request.url).searchParams.get('slug') || 'lorena-rayla-xv'

  const { data: event } = await supabaseAdmin
    .from('events')
    .select('id, upload_enabled, gallery_visibility, status')
    .eq('slug', slug)
    .single()

  if (!event) {
    return NextResponse.json({ stats: { totalPhotos: 0, totalVideos: 0, totalGuests: 0 }, uploadEnabled: false })
  }

  const [photosRes, videosRes, guestsRes] = await Promise.all([
    supabaseAdmin
      .from('media')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', event.id)
      .eq('moderation_status', 'approved')
      .eq('media_type', 'photo'),
    supabaseAdmin
      .from('media')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', event.id)
      .eq('moderation_status', 'approved')
      .eq('media_type', 'video'),
    supabaseAdmin
      .from('media')
      .select('uploader_name')
      .eq('event_id', event.id)
      .eq('moderation_status', 'approved'),
  ])

  const uniqueGuests = new Set(guestsRes.data?.map((m) => m.uploader_name) || []).size

  return NextResponse.json({
    stats: {
      totalPhotos: photosRes.count || 0,
      totalVideos: videosRes.count || 0,
      totalGuests: uniqueGuests,
    },
    uploadEnabled: event.upload_enabled && event.status === 'active',
    galleryVisibility: event.gallery_visibility,
  })
}
