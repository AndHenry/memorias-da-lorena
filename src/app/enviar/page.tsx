'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Upload, X, CheckCircle, AlertCircle, RefreshCw, ArrowLeft,
  Camera, Film, Image as ImageIcon, Sparkles, Plus,
} from 'lucide-react'
import StarField from '@/components/ui/StarField'
import { useGuest } from '@/hooks/useGuest'
import { useUpload } from '@/hooks/useUpload'
import { ToastContainer, useToast } from '@/components/ui/Toast'
import { formatBytes } from '@/lib/validations'

const EVENT_SLUG = process.env.NEXT_PUBLIC_EVENT_SLUG || 'lorena-rayla-xv'

export default function EnviarPage() {
  const router = useRouter()
  const { guest, isLoading } = useGuest()
  const { files, isUploading, uploadedCount, addFiles, removeFile, clearAll, uploadAll, retryFile, MAX_FILES, MAX_PHOTO_MB, MAX_VIDEO_MB } = useUpload()
  const { toasts, show, remove } = useToast()
  const [dragOver, setDragOver] = useState(false)
  const [allDone, setAllDone] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Redirect if not identified
  useEffect(() => {
    if (!isLoading && !guest) router.replace('/identificacao')
  }, [guest, isLoading, router])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files?.length) return
      const result = addFiles(e.target.files)
      if (result?.errors.length) {
        result.errors.forEach((err) => show(err, 'error'))
      }
      e.target.value = ''
    },
    [addFiles, show]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      if (!e.dataTransfer.files.length) return
      const result = addFiles(e.dataTransfer.files)
      if (result?.errors.length) {
        result.errors.forEach((err) => show(err, 'error'))
      }
    },
    [addFiles, show]
  )

  const handleUpload = async () => {
    if (!guest) return
    await uploadAll(EVENT_SLUG, guest.name, guest.sessionToken, (count) => {
      if (count > 0) {
        show(
          `${count} ${count === 1 ? 'arquivo enviado' : 'arquivos enviados'} com sucesso! 🌟`,
          'success'
        )
        setAllDone(true)
      }
    })
  }

  const pendingCount = files.filter((f) => f.status === 'pending').length
  const successCount = files.filter((f) => f.status === 'success').length
  const errorCount   = files.filter((f) => f.status === 'error').length

  if (isLoading) return null

  return (
    <main className="page-wrapper">
      <StarField count={80} />
      <ToastContainer toasts={toasts} remove={remove} />

      <div className="min-h-screen px-5 py-12">
        <div className="container-app max-w-2xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-sm mb-6 transition-colors"
              style={{ color: 'rgba(221,230,247,0.5)' }}>
              <ArrowLeft size={16} /> Voltar
            </Link>
            <div className="text-center animate-slide-up">
              <p className="text-sm font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--aurora-pink)' }}>
                Olá, <span style={{ color: 'var(--star-gold)' }}>{guest?.name}</span>! ✨
              </p>
              <h1 className="heading-lg" style={{ fontFamily: 'var(--font-title)' }}>
                Envie suas lembranças
              </h1>
              <p className="text-muted text-sm mt-2">
                Fotos até {MAX_PHOTO_MB}MB · Vídeos até {MAX_VIDEO_MB}MB · Máximo {MAX_FILES} arquivos por vez
              </p>
            </div>
          </div>

          {/* Success screen */}
          {allDone && successCount > 0 && pendingCount === 0 && (
            <div className="glass-card-gold p-8 text-center mb-8 animate-slide-up">
              <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center pulse-gold"
                style={{ background: 'rgba(244,208,63,0.15)', border: '2px solid rgba(244,208,63,0.4)' }}>
                <Sparkles size={36} style={{ color: 'var(--star-gold)' }} />
              </div>
              <h2 className="heading-md mb-3" style={{ fontFamily: 'var(--font-title)', color: 'var(--star-gold)' }}>
                Chegaram ao nosso universo! 🌟
              </h2>
              <p className="text-muted mb-6">
                Suas lembranças chegaram ao nosso universo! Obrigado por fazer parte dessa noite estrelada.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/galeria" className="btn btn-primary">Ver a galeria</Link>
                <button onClick={() => { clearAll(); setAllDone(false) }} className="btn btn-secondary">
                  Enviar mais fotos
                </button>
              </div>
            </div>
          )}

          {/* Upload Zone */}
          {(!allDone || pendingCount > 0) && (
            <>
              <div
                id="upload-zone"
                className={`upload-zone mb-6 animate-slide-up ${dragOver ? 'drag-over' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                aria-label="Clique ou arraste arquivos para enviar"
                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  id="file-input"
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                  multiple
                  className="sr-only"
                  onChange={handleFileChange}
                  capture={undefined}
                />
                <div className="pointer-events-none">
                  <div className="flex justify-center mb-4 gap-3">
                    <Camera size={28} style={{ color: 'var(--star-gold)', opacity: 0.8 }} />
                    <Film size={28}   style={{ color: 'var(--cosmic-light)', opacity: 0.8 }} />
                  </div>
                  <p className="font-semibold text-lg mb-1" style={{ color: 'var(--star-silver)' }}>
                    Toque para selecionar ou arraste arquivos
                  </p>
                  <p className="text-muted text-sm">
                    JPG, PNG, WebP, MP4, WebM — até {files.length}/{MAX_FILES} selecionados
                  </p>
                </div>
              </div>

              {/* File list */}
              {files.length > 0 && (
                <div className="glass-card p-4 mb-6 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold" style={{ color: 'var(--star-gold)' }}>
                      {files.length} {files.length === 1 ? 'arquivo' : 'arquivos'} selecionados
                    </p>
                    <button onClick={clearAll} className="text-xs text-muted hover:text-red-400 transition-colors">
                      Remover todos
                    </button>
                  </div>

                  {files.map((file) => (
                    <FileItem key={file.id} file={file} onRemove={removeFile} onRetry={retryFile} />
                  ))}

                  {/* Add more */}
                  {files.length < MAX_FILES && !isUploading && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed text-sm transition-colors"
                      style={{ borderColor: 'var(--glass-border)', color: 'rgba(221,230,247,0.5)' }}
                    >
                      <Plus size={16} /> Adicionar mais
                    </button>
                  )}
                </div>
              )}

              {/* Upload button */}
              {files.length > 0 && (
                <div className="text-center">
                  {errorCount > 0 && !isUploading && (
                    <p className="text-sm mb-3" style={{ color: '#f87171' }}>
                      {errorCount} {errorCount === 1 ? 'arquivo falhou' : 'arquivos falharam'}. Tente novamente nos itens acima.
                    </p>
                  )}
                  <button
                    id="upload-submit"
                    onClick={handleUpload}
                    disabled={isUploading || pendingCount === 0}
                    className="btn btn-primary btn-lg w-full sm:w-auto"
                  >
                    {isUploading ? (
                      <>
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-t-transparent rounded-full"
                          style={{ borderColor: 'rgba(26,10,64,0.3)', borderTopColor: 'transparent' }} />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload size={20} />
                        Enviar {pendingCount > 0 ? `${pendingCount} arquivo${pendingCount > 1 ? 's' : ''}` : 'fotos'}
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}

function FileItem({
  file,
  onRemove,
  onRetry,
}: {
  file: import('@/types/database').UploadFile
  onRemove: (id: string) => void
  onRetry: (id: string) => void
}) {
  const isImage = file.file.type.startsWith('image/')

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
      {/* Thumbnail */}
      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.05)' }}>
        {file.preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={file.preview} alt="" className="w-full h-full object-cover" />
        ) : (
          <Film size={20} style={{ color: 'var(--cosmic-light)' }} />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--star-silver)' }}>
          {file.file.name}
        </p>
        <p className="text-xs text-muted">{formatBytes(file.file.size)}</p>

        {/* Progress bar */}
        {file.status === 'uploading' && (
          <div className="progress-bar mt-1">
            <div className="progress-fill" style={{ width: `${file.progress}%` }} />
          </div>
        )}

        {file.status === 'error' && (
          <p className="text-xs mt-1" style={{ color: '#f87171' }}>{file.error}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-2">
        {file.status === 'success' && (
          <CheckCircle size={20} style={{ color: '#22c55e' }} aria-label="Enviado" />
        )}
        {file.status === 'error' && (
          <button onClick={() => onRetry(file.id)} aria-label="Tentar novamente"
            className="p-1 rounded hover:bg-white/10 transition-colors">
            <RefreshCw size={16} style={{ color: '#fbbf24' }} />
          </button>
        )}
        {file.status !== 'uploading' && file.status !== 'success' && (
          <button onClick={() => onRemove(file.id)} aria-label="Remover arquivo"
            className="p-1 rounded hover:bg-white/10 transition-colors">
            <X size={16} style={{ color: 'rgba(221,230,247,0.5)' }} />
          </button>
        )}
        {file.status === 'uploading' && (
          <span className="text-xs font-semibold" style={{ color: 'var(--star-gold)' }}>
            {file.progress}%
          </span>
        )}
      </div>
    </div>
  )
}
