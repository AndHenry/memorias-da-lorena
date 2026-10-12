/**
 * Extrai um frame do vídeo no navegador para servir como miniatura (thumbnail) real.
 */
export async function extractVideoThumbnail(file: File): Promise<Blob | null> {
  if (typeof window === 'undefined') return null

  return new Promise((resolve) => {
    let settled = false
    const finish = (blob: Blob | null) => {
      if (settled) return
      settled = true
      try {
        URL.revokeObjectURL(url)
      } catch {}
      resolve(blob)
    }

    // Timeout de segurança (máximo 4 segundos para tentar extrair)
    const timer = setTimeout(() => finish(null), 4000)

    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true
    video.crossOrigin = 'anonymous'

    let url = ''
    try {
      url = URL.createObjectURL(file)
      video.src = url
    } catch {
      clearTimeout(timer)
      return resolve(null)
    }

    video.onloadeddata = () => {
      // Busca 1 segundo ou a metade se o vídeo for menor que 2s
      const seekTime = Math.min(1.0, (video.duration || 1) / 2)
      try {
        video.currentTime = seekTime
      } catch {
        // Se falhar o seek, tenta capturar imediatamente
        captureFrame()
      }
    }

    const captureFrame = () => {
      try {
        const width = video.videoWidth || 640
        const height = video.videoHeight || 360
        if (width === 0 || height === 0) {
          clearTimeout(timer)
          return finish(null)
        }

        const maxDim = 640
        const scale = Math.min(1, maxDim / Math.max(width, height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(width * scale)
        canvas.height = Math.round(height * scale)

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          clearTimeout(timer)
          return finish(null)
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(
          (blob) => {
            clearTimeout(timer)
            finish(blob)
          },
          'image/jpeg',
          0.82
        )
      } catch {
        clearTimeout(timer)
        finish(null)
      }
    }

    video.onseeked = () => {
      captureFrame()
    }

    video.onerror = () => {
      clearTimeout(timer)
      finish(null)
    }
  })
}
