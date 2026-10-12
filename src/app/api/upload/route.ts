import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { validateFileType, validateFileSize, ALLOWED_PHOTO_TYPES, ALLOWED_VIDEO_TYPES } from '@/lib/validations'

export const maxDuration = 60 // seconds

export async function POST(request: NextRequest) {
  // Rate limiting: 30 uploads per minute per IP
  const ip = getClientIp(request)
  const limit = rateLimit(`upload:${ip}`, { maxRequests: 30, windowMs: 60_000 })
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Muitas requisições. Aguarde um momento antes de tentar novamente.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((limit.resetAt - Date.now()) / 1000)) } }
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const storagePath = formData.get('storagePath') as string | null
    const guestName = formData.get('guestName') as string | null
    const sessionToken = formData.get('sessionToken') as string | null
    const eventSlug = formData.get('eventSlug') as string | null
    const originalFilename = formData.get('originalFilename') as string | null
    const mediaType = formData.get('mediaType') as 'photo' | 'video' | null

    // Validate required fields
    if (!file || !storagePath || !guestName || !sessionToken || !eventSlug || !mediaType) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes.' }, { status: 400 })
    }

    // Validate guest name
    if (guestName.trim().length < 2 || guestName.trim().length > 80) {
      return NextResponse.json({ error: 'Nome inválido.' }, { status: 400 })
    }

    // Validate file type (server-side)
    const typeCheck = validateFileType(file)
    if (!typeCheck.valid) {
      return NextResponse.json({ error: typeCheck.error }, { status: 400 })
    }

    // Validate MIME type more strictly
    const mimeType = file.type.toLowerCase()
    const isPhoto = ALLOWED_PHOTO_TYPES.includes(mimeType)
    const isVideo = ALLOWED_VIDEO_TYPES.includes(mimeType)
    if (!isPhoto && !isVideo) {
      return NextResponse.json({ error: 'Tipo de arquivo não permitido.' }, { status: 400 })
    }

    // Get event config and validate it
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('id, upload_enabled, max_file_size_mb, max_video_size_mb, status, moderation_enabled')
      .eq('slug', eventSlug)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Evento não encontrado.' }, { status: 404 })
    }

    if (!event.upload_enabled || event.status !== 'active') {
      return NextResponse.json({ error: 'O envio de fotos está desabilitado no momento.' }, { status: 403 })
    }

    // Validate file size against event config
    const sizeCheck = validateFileSize(file, event.max_file_size_mb, event.max_video_size_mb)
    if (!sizeCheck.valid) {
      return NextResponse.json({ error: sizeCheck.error }, { status: 413 })
    }

    // Rate limit per session token (10 files per hour)
    const sessionLimit = rateLimit(`session:${sessionToken}`, { maxRequests: 50, windowMs: 60 * 60 * 1000 })
    if (!sessionLimit.allowed) {
      return NextResponse.json({ error: 'Limite de envios atingido. Tente novamente mais tarde.' }, { status: 429 })
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { error: storageError } = await supabaseAdmin.storage
      .from('media')
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: false,
        cacheControl: '3600',
      })

    if (storageError) {
      console.error('Storage error:', storageError)
      return NextResponse.json(
        { error: 'Erro ao armazenar o arquivo. Tente novamente.' },
        { status: 500 }
      )
    }

    // Insert media record
    const { data: mediaRecord, error: dbError } = await supabaseAdmin
      .from('media')
      .insert({
        event_id: event.id,
        uploader_name: guestName.trim(),
        storage_path: storagePath,
        media_type: mediaType,
        original_filename: originalFilename,
        file_size: file.size,
        mime_type: mimeType,
        moderation_status: event.moderation_enabled ? 'pending' : 'approved',
      })
      .select('id')
      .single()

    if (dbError) {
      console.error('DB error:', dbError)
      // Try to cleanup storage on DB failure
      await supabaseAdmin.storage.from('media').remove([storagePath])
      return NextResponse.json({ error: 'Erro ao registrar o arquivo.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      mediaId: mediaRecord.id,
      message: event.moderation_enabled
        ? 'Arquivo enviado! Ficará visível após revisão.'
        : 'Arquivo enviado com sucesso!',
    })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Erro interno. Tente novamente.' }, { status: 500 })
  }
}
