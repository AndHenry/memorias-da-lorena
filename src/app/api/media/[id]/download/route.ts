import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

type Params = { params: Promise<{ id: string }> }

// GET /api/media/[id]/download
export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params

  const { data: media } = await supabaseAdmin
    .from('media')
    .select('storage_path, original_filename, moderation_status, media_type')
    .eq('id', id)
    .single()

  if (!media || media.moderation_status !== 'approved') {
    return NextResponse.json({ error: 'Arquivo não encontrado.' }, { status: 404 })
  }

  // Check downloads enabled in event
  const { data: event } = await supabaseAdmin
    .from('events')
    .select('downloads_enabled')
    .single()

  if (event && !event.downloads_enabled) {
    return NextResponse.json({ error: 'Downloads não estão habilitados.' }, { status: 403 })
  }

  const { data: signedData, error } = await supabaseAdmin.storage
    .from('media')
    .createSignedUrl(media.storage_path, 60 * 5, {
      download: media.original_filename || true,
    })

  if (error || !signedData) {
    return NextResponse.json({ error: 'Erro ao gerar URL de download.' }, { status: 500 })
  }

  return NextResponse.redirect(signedData.signedUrl)
}
