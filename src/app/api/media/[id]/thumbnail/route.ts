import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

import { getAdminUser } from '@/lib/supabase/server'

type Params = { params: Promise<{ id: string }> }

// GET /api/media/[id]/thumbnail
export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params

  const { data: media } = await supabaseAdmin
    .from('media')
    .select('storage_path, thumbnail_path, moderation_status')
    .eq('id', id)
    .single()

  const adminUser = await getAdminUser(request)

  if (!media || (media.moderation_status !== 'approved' && !adminUser)) {
    return NextResponse.json({ error: 'Arquivo não encontrado.' }, { status: 404 })
  }

  const path = media.thumbnail_path || media.storage_path

  const { data: signedData, error } = await supabaseAdmin.storage
    .from('media')
    .createSignedUrl(path, 30 * 60) // 30 min for thumbnails

  if (error || !signedData) {
    return NextResponse.json({ error: 'Erro ao gerar URL.' }, { status: 500 })
  }

  return NextResponse.redirect(signedData.signedUrl)
}
