import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

type Params = { params: Promise<{ id: string }> }

// GET /api/media/[id]/signed-url — returns a redirect to a signed URL
export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params

  const { data: media } = await supabaseAdmin
    .from('media')
    .select('storage_path, moderation_status, media_type')
    .eq('id', id)
    .single()

  if (!media || media.moderation_status !== 'approved') {
    return NextResponse.json({ error: 'Arquivo não encontrado.' }, { status: 404 })
  }

  const { data: signedData, error } = await supabaseAdmin.storage
    .from('media')
    .createSignedUrl(media.storage_path, 60 * 60) // 1 hour

  if (error || !signedData) {
    return NextResponse.json({ error: 'Erro ao gerar URL.' }, { status: 500 })
  }

  return NextResponse.redirect(signedData.signedUrl)
}
