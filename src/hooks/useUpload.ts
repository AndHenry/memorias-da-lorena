'use client'

import { useState, useCallback, useRef } from 'react'
import type { UploadFile } from '@/types/database'
import {
  validateFileType,
  validateFileSize,
  generateStoragePath,
  getMediaType,
  sanitizeFilename,
} from '@/lib/validations'

const MAX_PHOTO_MB = parseInt(process.env.NEXT_PUBLIC_MAX_PHOTO_MB || '15')
const MAX_VIDEO_MB = parseInt(process.env.NEXT_PUBLIC_MAX_VIDEO_MB || '100')
const MAX_FILES = parseInt(process.env.NEXT_PUBLIC_MAX_FILES || '10')

export function useUpload() {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedCount, setUploadedCount] = useState(0)
  const abortRef = useRef<AbortController | null>(null)

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const arr = Array.from(newFiles)
      const remaining = MAX_FILES - files.length
      const toAdd = arr.slice(0, remaining)
      const errors: string[] = []

      const valid = toAdd.filter((file) => {
        const typeCheck = validateFileType(file)
        if (!typeCheck.valid) { errors.push(typeCheck.error!); return false }
        const sizeCheck = validateFileSize(file, MAX_PHOTO_MB, MAX_VIDEO_MB)
        if (!sizeCheck.valid) { errors.push(sizeCheck.error!); return false }
        return true
      })

      const uploadFiles: UploadFile[] = valid.map((file) => ({
        id: Math.random().toString(36).slice(2),
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        progress: 0,
        status: 'pending' as const,
      }))

      setFiles((prev) => [...prev, ...uploadFiles])
      return { added: valid.length, errors }
    },
    [files.length]
  )

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id)
      if (file?.preview) URL.revokeObjectURL(file.preview)
      return prev.filter((f) => f.id !== id)
    })
  }, [])

  const clearAll = useCallback(() => {
    setFiles((prev) => {
      prev.forEach((f) => { if (f.preview) URL.revokeObjectURL(f.preview) })
      return []
    })
    setUploadedCount(0)
  }, [])

  const uploadAll = useCallback(
    async (
      eventSlug: string,
      guestName: string,
      sessionToken: string,
      onComplete?: (count: number) => void
    ) => {
      const pending = files.filter((f) => f.status === 'pending')
      if (!pending.length || isUploading) return

      setIsUploading(true)
      abortRef.current = new AbortController()
      let successCount = 0

      for (const uploadFile of pending) {
        try {
          setFiles((prev) =>
            prev.map((f) => f.id === uploadFile.id ? { ...f, status: 'uploading', progress: 0 } : f)
          )

          const storagePath = generateStoragePath(eventSlug, guestName, uploadFile.file.name)
          const formData = new FormData()
          formData.append('file', uploadFile.file)
          formData.append('storagePath', storagePath)
          formData.append('guestName', guestName)
          formData.append('sessionToken', sessionToken)
          formData.append('eventSlug', eventSlug)
          formData.append('originalFilename', sanitizeFilename(uploadFile.file.name))
          formData.append('mediaType', getMediaType(uploadFile.file))

          // Use XMLHttpRequest for progress tracking
          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhr.open('POST', '/api/upload')

            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable) {
                const pct = Math.round((e.loaded / e.total) * 100)
                setFiles((prev) =>
                  prev.map((f) => f.id === uploadFile.id ? { ...f, progress: pct } : f)
                )
              }
            }

            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                const data = JSON.parse(xhr.responseText)
                setFiles((prev) =>
                  prev.map((f) =>
                    f.id === uploadFile.id
                      ? { ...f, status: 'success', progress: 100, mediaId: data.mediaId }
                      : f
                  )
                )
                successCount++
                resolve()
              } else {
                let errMsg = 'Erro no envio'
                try { errMsg = JSON.parse(xhr.responseText)?.error || errMsg } catch {}
                reject(new Error(errMsg))
              }
            }

            xhr.onerror = () => reject(new Error('Erro de conexão. Verifique sua internet.'))
            xhr.onabort = () => reject(new Error('Envio cancelado.'))

            if (abortRef.current?.signal) {
              abortRef.current.signal.addEventListener('abort', () => xhr.abort())
            }

            xhr.send(formData)
          })
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Erro desconhecido'
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id ? { ...f, status: 'error', error: message } : f
            )
          )
        }
      }

      setIsUploading(false)
      setUploadedCount((c) => c + successCount)
      onComplete?.(successCount)
    },
    [files, isUploading]
  )

  const retryFile = useCallback((id: string) => {
    setFiles((prev) =>
      prev.map((f) => f.id === id ? { ...f, status: 'pending', progress: 0, error: undefined } : f)
    )
  }, [])

  const cancelUpload = useCallback(() => {
    abortRef.current?.abort()
    setIsUploading(false)
  }, [])

  return {
    files,
    isUploading,
    uploadedCount,
    addFiles,
    removeFile,
    clearAll,
    uploadAll,
    retryFile,
    cancelUpload,
    MAX_FILES,
    MAX_PHOTO_MB,
    MAX_VIDEO_MB,
  }
}
