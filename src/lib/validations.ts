// Allowed MIME types and extensions
export const ALLOWED_PHOTO_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]

export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
]

export const ALLOWED_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif',
  '.mp4', '.webm', '.mov', '.avi',
]

export function validateFileType(file: File): { valid: boolean; error?: string } {
  const mimeType = file.type.toLowerCase()
  const isPhoto = ALLOWED_PHOTO_TYPES.includes(mimeType)
  const isVideo = ALLOWED_VIDEO_TYPES.includes(mimeType)

  if (!isPhoto && !isVideo) {
    return {
      valid: false,
      error: `Formato não suportado: ${file.type || 'desconhecido'}. Use JPG, PNG, WebP, MP4 ou WebM.`,
    }
  }

  return { valid: true }
}

export function validateFileSize(
  file: File,
  maxPhotoMb: number,
  maxVideoMb: number
): { valid: boolean; error?: string } {
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type.toLowerCase())
  const maxBytes = isVideo ? maxVideoMb * 1024 * 1024 : maxPhotoMb * 1024 * 1024
  const maxLabel = isVideo ? `${maxVideoMb}MB` : `${maxPhotoMb}MB`

  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `"${file.name}" é muito grande (${formatBytes(file.size)}). Limite: ${maxLabel}.`,
    }
  }

  return { valid: true }
}

export function getMediaType(file: File): 'photo' | 'video' {
  return ALLOWED_VIDEO_TYPES.includes(file.type.toLowerCase()) ? 'video' : 'photo'
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function sanitizeFilename(filename: string): string {
  return filename
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .toLowerCase()
}

export function generateStoragePath(
  eventSlug: string,
  guestName: string,
  filename: string
): string {
  const safeGuest = guestName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .toLowerCase()
    .slice(0, 30)

  const safeFilename = sanitizeFilename(filename)
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 8)
  return `${eventSlug}/${safeGuest}/${timestamp}_${random}_${safeFilename}`
}

export function validateGuestName(name: string): { valid: boolean; error?: string } {
  const trimmed = name.trim()
  if (!trimmed) return { valid: false, error: 'Por favor, informe seu nome.' }
  if (trimmed.length < 2) return { valid: false, error: 'O nome deve ter pelo menos 2 caracteres.' }
  if (trimmed.length > 80) return { valid: false, error: 'O nome deve ter no máximo 80 caracteres.' }
  // Block script injection
  if (/<script|javascript:|on\w+\s*=/i.test(trimmed)) {
    return { valid: false, error: 'Nome inválido.' }
  }
  return { valid: true }
}
