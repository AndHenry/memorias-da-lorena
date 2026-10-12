'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { Camera, Film, Star, Download, X, ChevronLeft, ChevronRight, ArrowLeft, Filter, Heart } from 'lucide-react'
import StarField from '@/components/ui/StarField'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { Media } from '@/types/database'

const PAGE_SIZE = 20
const EVENT_SLUG = process.env.NEXT_PUBLIC_EVENT_SLUG || 'lorena-rayla-xv'

type FilterType = 'all' | 'photo' | 'video'

export default function GaleriaPage() {
  const [media, setMedia] = useState<Media[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [lightbox, setLightbox] = useState<{ index: number } | null>(null)
  const [galleryState, setGalleryState] = useState<'loading' | 'ok' | 'empty' | 'private'>('loading')
  const loadRef = useRef(false)

  const fetchMedia = useCallback(
    async (pageNum: number, type: FilterType, reset = false) => {
      if (loadRef.current) return
      loadRef.current = true
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          slug: EVENT_SLUG,
          page: String(pageNum),
          limit: String(PAGE_SIZE),
          ...(type !== 'all' ? { type } : {}),
        })
        const res = await fetch(`/api/media?${params}`)
        const data = await res.json()

        if (data.error === 'private') { setGalleryState('private'); return }

        const items: Media[] = data.media || []
        setMedia((prev) => (reset ? items : [...prev, ...items]))
        setHasMore(items.length === PAGE_SIZE)
        setGalleryState(reset && items.length === 0 ? 'empty' : 'ok')
      } catch {
        setGalleryState('ok')
      } finally {
        setIsLoading(false)
        loadRef.current = false
      }
    },
    []
  )

  useEffect(() => {
    setPage(0)
    setMedia([])
    fetchMedia(0, filter, true)
  }, [filter, fetchMedia])

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    fetchMedia(next, filter, false)
  }

  const openLightbox = (index: number) => {
    setLightbox({ index })
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setLightbox(null)
    document.body.style.overflow = ''
  }

  const navigate = (dir: -1 | 1) => {
    if (!lightbox) return
    const next = lightbox.index + dir
    if (next >= 0 && next < media.length) setLightbox({ index: next })
  }

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!lightbox) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') navigate(1)
      if (e.key === 'ArrowLeft') navigate(-1)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lightbox, media.length]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const currentItem = lightbox ? media[lightbox.index] : null

  return (
    <main className="page-wrapper">
      <StarField count={80} />

      {/* Lightbox */}
      {lightbox && currentItem && (
        <div className="lightbox-overlay" onClick={closeLightbox} role="dialog" aria-modal="true" aria-label="Visualizar mídia">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 p-2 rounded-full glass-card hover:bg-white/10 transition-colors"
            aria-label="Fechar"
          >
            <X size={24} />
          </button>

          {lightbox.index > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); navigate(-1) }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full glass-card hover:bg-white/10 transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft size={28} />
            </button>
          )}

          {lightbox.index < media.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); navigate(1) }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full glass-card hover:bg-white/10 transition-colors"
              aria-label="Próxima"
            >
              <ChevronRight size={28} />
            </button>
          )}

          <div
            className="max-w-5xl max-h-[90vh] w-full flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {currentItem.media_type === 'video' ? (
              <video
                src={`/api/media/${currentItem.id}/signed-url`}
                controls
                autoPlay
                className="max-h-[75vh] max-w-full rounded-xl"
                style={{ background: '#000' }}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/api/media/${currentItem.id}/signed-url`}
                alt={`Foto de ${currentItem.uploader_name}`}
                className="max-h-[75vh] max-w-full rounded-xl object-contain"
              />
            )}
            <div className="glass-card px-5 py-3 flex items-center gap-4">
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--star-gold)' }}>
                  {currentItem.uploader_name}
                </p>
                <p className="text-xs text-muted">
                  {new Date(currentItem.created_at).toLocaleString('pt-BR')}
                </p>
              </div>
              <a
                href={`/api/media/${currentItem.id}/download`}
                className="btn btn-secondary btn-sm ml-auto"
                download
                aria-label="Baixar"
              >
                <Download size={16} /> Baixar
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Page content */}
      <div className="min-h-screen px-5" style={{ paddingTop: '3.5rem', paddingBottom: '3rem' }}>
        <div className="container-app">
          {/* Header */}
          <div className="flex items-center gap-4" style={{ marginBottom: '2rem' }}>
            <Link href="/" className="p-2 glass-card hover:bg-white/10 transition-colors rounded-xl" aria-label="Voltar">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="heading-lg" style={{ fontFamily: 'var(--font-title)', color: 'var(--star-gold)' }}>
                Galeria de Memórias
              </h1>
              {media.length > 0 && (
                <span
                  className="inline-block text-xs font-semibold px-3 py-1 rounded-full mt-1"
                  style={{ background: 'rgba(244,208,63,0.1)', border: '1px solid rgba(244,208,63,0.2)', color: 'var(--star-gold)' }}
                >
                  ✨ {media.length} {media.length === 1 ? 'memória compartilhada' : 'memórias compartilhadas'}
                </span>
              )}
            </div>
          </div>
          <div className="divider-gold" style={{ marginBottom: '1.5rem' }} />

          {/* Filters */}
          <div className="flex flex-wrap gap-3" style={{ marginBottom: '1rem' }}>
            {(['all', 'photo', 'video'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
              >
                {f === 'all' && <><Star size={14} /> Todas</>}
                {f === 'photo' && <><Camera size={14} /> Fotos</>}
                {f === 'video' && <><Film size={14} /> Vídeos</>}
              </button>
            ))}
          </div>

          {/* States */}
          {galleryState === 'loading' && (
            <LoadingSpinner size={40} text="Carregando memórias..." className="py-24" />
          )}

          {galleryState === 'private' && (
            <div className="text-center py-24">
              <p className="heading-md mb-3" style={{ fontFamily: 'var(--font-title)', color: 'var(--star-gold)' }}>
                Galeria privada
              </p>
              <p className="text-muted">A galeria está disponível apenas para convidados autorizados.</p>
            </div>
          )}

          {galleryState === 'empty' && (
            <div className="text-center py-24">
              <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'rgba(244,208,63,0.1)', border: '1px solid rgba(244,208,63,0.2)' }}>
                <Camera size={32} style={{ color: 'var(--star-gold)' }} />
              </div>
              <p className="heading-md mb-3" style={{ fontFamily: 'var(--font-title)' }}>
                Ainda sem memórias
              </p>
              <p className="text-muted mb-6">Seja o primeiro a compartilhar uma lembrança!</p>
              <Link href="/identificacao" className="btn btn-primary">Enviar fotos</Link>
            </div>
          )}

          {/* Grid */}
          {galleryState === 'ok' && media.length > 0 && (
            <>
              <div className="media-grid" role="list" aria-label="Galeria de fotos e vídeos" style={{ marginTop: '1.5rem' }}>
                {media.map((item, index) => (
                  <div
                    key={item.id}
                    className="media-item"
                    role="listitem"
                    onClick={() => openLightbox(index)}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && openLightbox(index)}
                    aria-label={`${item.media_type === 'video' ? 'Vídeo' : 'Foto'} de ${item.uploader_name}`}
                  >
                    {item.media_type === 'video' ? (
                      <div className="relative" style={{ paddingBottom: '75%', background: '#0a0e1a' }}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Film size={32} style={{ color: 'var(--cosmic-light)' }} />
                        </div>
                        <div className="absolute bottom-2 left-2">
                          <span className="badge badge-video">
                            <Film size={10} /> Vídeo
                          </span>
                        </div>
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`/api/media/${item.id}/thumbnail`}
                        alt={`Foto de ${item.uploader_name}`}
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                    <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
                      style={{ background: 'linear-gradient(to top, rgba(3,7,18,0.8) 0%, transparent 60%)' }}>
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-xs font-semibold truncate" style={{ color: 'var(--star-gold)' }}>
                          {item.uploader_name}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load more */}
              {hasMore && (
                <div className="text-center mt-10">
                  {isLoading ? (
                    <LoadingSpinner size={28} text="Carregando mais..." />
                  ) : (
                    <button onClick={loadMore} className="btn btn-secondary btn-lg">
                      Carregar mais memórias
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}
