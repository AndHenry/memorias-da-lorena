'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  Camera,
  Film,
  Star,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Filter,
  Heart,
  Search,
  Play,
  Sparkles,
  MessageSquareQuote,
} from 'lucide-react'
import StarField from '@/components/ui/StarField'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { Media } from '@/types/database'

const PAGE_SIZE = 20
const EVENT_SLUG = process.env.NEXT_PUBLIC_EVENT_SLUG || 'lorena-rayla-xv'

type FilterType = 'all' | 'photo' | 'video'
type SortType = 'newest' | 'most_liked'

function getSessionToken(): string {
  if (typeof window === 'undefined') return ''
  let token = localStorage.getItem('lorena_reaction_token')
  if (!token) {
    token = 'r_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('lorena_reaction_token', token)
  }
  return token
}

export default function GaleriaPage() {
  const [media, setMedia] = useState<Media[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [sortBy, setSortBy] = useState<SortType>('newest')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [lightbox, setLightbox] = useState<{ index: number } | null>(null)
  const [galleryState, setGalleryState] = useState<'loading' | 'ok' | 'empty' | 'empty-filter' | 'empty-search' | 'private'>('loading')
  const [totalApproved, setTotalApproved] = useState(0)
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const loadRef = useRef(false)

  // Initialize liked IDs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('lorena_liked_ids')
      if (stored) {
        setLikedIds(new Set(JSON.parse(stored)))
      }
    } catch {}
  }, [])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim())
    }, 350)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const fetchMedia = useCallback(
    async (pageNum: number, type: FilterType, sort: SortType, search: string, reset = false) => {
      if (loadRef.current) return
      loadRef.current = true
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          slug: EVENT_SLUG,
          page: String(pageNum),
          limit: String(PAGE_SIZE),
          sort,
          ...(type !== 'all' ? { type } : {}),
          ...(search ? { uploader: search } : {}),
        })
        const res = await fetch(`/api/media?${params}`)
        const data = await res.json()

        if (data.error === 'private') {
          setGalleryState('private')
          return
        }

        const items: Media[] = data.media || []
        setMedia((prev) => (reset ? items : [...prev, ...items]))
        setHasMore(items.length === PAGE_SIZE)

        if (reset && items.length === 0) {
          if (search) {
            setGalleryState('empty-search')
          } else if (type !== 'all') {
            setGalleryState('empty-filter')
          } else {
            setTotalApproved(data.total_approved ?? 0)
            setGalleryState('empty')
          }
        } else {
          setGalleryState('ok')
        }
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
    fetchMedia(0, filter, sortBy, debouncedSearch, true)
  }, [filter, sortBy, debouncedSearch, fetchMedia])

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    fetchMedia(next, filter, sortBy, debouncedSearch, false)
  }

  // Toggle Like (❤️)
  const toggleReaction = async (mediaId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    const token = getSessionToken()
    const isCurrentlyLiked = likedIds.has(mediaId)

    // Optimistic UI update
    setLikedIds((prev) => {
      const next = new Set(prev)
      if (isCurrentlyLiked) {
        next.delete(mediaId)
      } else {
        next.add(mediaId)
      }
      try {
        localStorage.setItem('lorena_liked_ids', JSON.stringify(Array.from(next)))
      } catch {}
      return next
    })

    setMedia((prev) =>
      prev.map((item) => {
        if (item.id === mediaId) {
          const currentCount = item.likes_count || 0
          return {
            ...item,
            likes_count: isCurrentlyLiked ? Math.max(0, currentCount - 1) : currentCount + 1,
          }
        }
        return item
      })
    )

    // Call API in background
    try {
      if (isCurrentlyLiked) {
        await fetch(`/api/media/${mediaId}/react`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_token: token, emoji: 'heart' }),
        })
      } else {
        await fetch(`/api/media/${mediaId}/react`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_token: token, emoji: 'heart' }),
        })
      }
    } catch (err) {
      console.warn('Erro ao atualizar reação:', err)
    }
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

      {/* Lightbox Modal */}
      {lightbox && currentItem && (
        <div
          className="lightbox-overlay"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Visualizar mídia"
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full glass-card hover:bg-white/10 transition-colors"
            aria-label="Fechar"
          >
            <X size={24} />
          </button>

          {lightbox.index > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                navigate(-1)
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full glass-card hover:bg-white/10 transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft size={28} />
            </button>
          )}

          {lightbox.index < media.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                navigate(1)
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full glass-card hover:bg-white/10 transition-colors"
              aria-label="Próxima"
            >
              <ChevronRight size={28} />
            </button>
          )}

          <div
            className="max-w-4xl max-h-[92vh] w-full flex flex-col items-center gap-3 px-4 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {currentItem.media_type === 'video' ? (
              <video
                src={`/api/media/${currentItem.id}/signed-url`}
                controls
                autoPlay
                className="max-h-[65vh] max-w-full rounded-2xl shadow-2xl"
                style={{ background: '#000' }}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/api/media/${currentItem.id}/signed-url`}
                alt={`Foto de ${currentItem.uploader_name}`}
                className="max-h-[65vh] max-w-full rounded-2xl object-contain shadow-2xl"
              />
            )}

            {/* Caption Bubble */}
            {currentItem.caption && (
              <div
                className="w-full glass-card px-5 py-3 rounded-xl text-center"
                style={{
                  background: 'rgba(244,208,63,0.06)',
                  borderColor: 'rgba(244,208,63,0.25)',
                }}
              >
                <p className="text-sm md:text-base italic font-serif leading-relaxed" style={{ color: 'var(--star-silver)' }}>
                  “{currentItem.caption}”
                </p>
              </div>
            )}

            {/* Info bar */}
            <div className="glass-card px-5 py-3 w-full flex items-center justify-between gap-3 rounded-xl">
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--star-gold)' }}>
                  {currentItem.uploader_name}
                </p>
                <p className="text-xs text-muted">
                  {new Date(currentItem.created_at).toLocaleString('pt-BR')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Heart Reaction button */}
                <button
                  onClick={(e) => toggleReaction(currentItem.id, e)}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all border ${
                    likedIds.has(currentItem.id)
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-500/20 scale-105'
                      : 'glass-card hover:bg-white/10 text-slate-300 border-white/10'
                  }`}
                  aria-label="Curtir"
                >
                  <Heart
                    size={16}
                    fill={likedIds.has(currentItem.id) ? '#f43f5e' : 'none'}
                    color={likedIds.has(currentItem.id) ? '#f43f5e' : 'currentColor'}
                  />
                  <span>{currentItem.likes_count || 0}</span>
                </button>

                {/* Download */}
                <a
                  href={`/api/media/${currentItem.id}/download`}
                  className="btn btn-secondary btn-sm"
                  download
                  aria-label="Baixar"
                >
                  <Download size={15} /> Baixar
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page content */}
      <div className="min-h-screen px-4 sm:px-6" style={{ paddingTop: '3.5rem', paddingBottom: '3.5rem' }}>
        <div className="container-app">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2.5 glass-card hover:bg-white/10 transition-colors rounded-xl flex-shrink-0"
                aria-label="Voltar para home"
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1
                  className="heading-lg"
                  style={{ fontFamily: 'var(--font-title)', color: 'var(--star-gold)' }}
                >
                  Galeria de Memórias
                </h1>
                {media.length > 0 && (
                  <span
                    className="inline-block text-xs font-semibold px-3 py-0.5 rounded-full mt-1"
                    style={{
                      background: 'rgba(244,208,63,0.1)',
                      border: '1px solid rgba(244,208,63,0.2)',
                      color: 'var(--star-gold)',
                    }}
                  >
                    ✨ {media.length} {media.length === 1 ? 'memória carregada' : 'memórias carregadas'}
                  </span>
                )}
              </div>
            </div>

            {/* Slideshow CTA link */}
            <Link
              href="/slideshow"
              className="btn btn-sm self-start sm:self-auto flex items-center gap-2 px-4 py-2"
              style={{
                background: 'linear-gradient(135deg, rgba(244,208,63,0.18), rgba(167,139,250,0.22))',
                borderColor: 'rgba(244,208,63,0.35)',
                color: 'var(--star-gold)',
              }}
            >
              <Sparkles size={16} />
              <span>Vídeo Recordação</span>
            </Link>
          </div>

          <div className="divider-gold mb-6" />

          {/* Search bar & Filter controls */}
          <div className="flex flex-col gap-5 mb-8">
            {/* Search Input */}
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Buscar por quem enviou (ex: Ana, Lucas...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field w-full text-sm"
                style={{
                  fontFamily: 'var(--font-body)',
                  paddingLeft: '1.25rem',
                  paddingRight: searchQuery ? '4.5rem' : '3rem',
                }}
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-muted hover:text-white transition-colors"
                    aria-label="Limpar busca"
                  >
                    <X size={16} />
                  </button>
                )}
                <Search
                  size={18}
                  className="pointer-events-none"
                  style={{ color: 'var(--star-gold)', opacity: 0.8 }}
                />
              </div>
            </div>

            {/* Filters and Sort */}
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-4">
              {/* Type filter */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-4">
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

              {/* Sort filter */}
              <div className="flex items-center gap-2 glass-card px-3 py-1.5 rounded-xl text-xs">
                <span className="text-muted mr-1 hidden sm:inline">Ordenar:</span>
                <button
                  onClick={() => setSortBy('newest')}
                  className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                    sortBy === 'newest'
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Mais Recentes
                </button>
                <button
                  onClick={() => setSortBy('most_liked')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors font-medium ${
                    sortBy === 'most_liked'
                      ? 'bg-rose-500 text-white font-bold shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Heart size={12} fill={sortBy === 'most_liked' ? '#fff' : 'none'} /> Mais Curtidas
                </button>
              </div>
            </div>
          </div>

          {/* Active Search feedback badge */}
          {debouncedSearch && (
            <div className="mb-4 flex items-center gap-2 text-xs" style={{ color: 'var(--star-silver)' }}>
              <span>Filtrando convidados por: <strong>&ldquo;{debouncedSearch}&rdquo;</strong></span>
              <button
                onClick={() => setSearchQuery('')}
                className="underline text-muted hover:text-white"
              >
                Limpar filtro
              </button>
            </div>
          )}

          {/* States */}
          {galleryState === 'loading' && (
            <LoadingSpinner size={40} text="Carregando memórias..." className="py-24" />
          )}

          {galleryState === 'private' && (
            <div className="text-center py-24">
              <p
                className="heading-md mb-3"
                style={{ fontFamily: 'var(--font-title)', color: 'var(--star-gold)' }}
              >
                Galeria privada
              </p>
              <p className="text-muted">A galeria está disponível apenas para convidados autorizados.</p>
            </div>
          )}

          {galleryState === 'empty' && (
            <div className="text-center py-24">
              <div
                className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center pulse-gold"
                style={{
                  background: 'rgba(244,208,63,0.08)',
                  border: '1px solid rgba(244,208,63,0.25)',
                }}
              >
                <Camera size={32} style={{ color: 'var(--star-gold)' }} />
              </div>
              <p
                className="heading-md mb-2"
                style={{ fontFamily: 'var(--font-title)', color: 'var(--star-gold)' }}
              >
                As memórias chegam em breve
              </p>
              <p className="text-muted mb-2" style={{ maxWidth: '26rem', margin: '0 auto 1.5rem' }}>
                {totalApproved === 0
                  ? 'Ainda ninguém enviou fotos. Seja o primeiro a fazer parte desta noite estrelada!'
                  : 'As fotos estão sendo revisadas e em breve aparecerão aqui. Obrigado por participar! 🌟'}
              </p>
              <Link href="/identificacao" className="btn btn-primary">
                Enviar minhas fotos
              </Link>
            </div>
          )}

          {galleryState === 'empty-search' && (
            <div className="text-center py-20">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'rgba(244,208,63,0.1)', border: '1px solid rgba(244,208,63,0.2)' }}
              >
                <Search size={24} style={{ color: 'var(--star-gold)' }} />
              </div>
              <p className="text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-title)' }}>
                Nenhuma foto de &ldquo;{debouncedSearch}&rdquo;
              </p>
              <p className="text-muted text-sm mb-5">
                Não encontramos mídias enviadas por esse nome ainda.
              </p>
              <button onClick={() => setSearchQuery('')} className="btn btn-secondary">
                Ver todas as fotos
              </button>
            </div>
          )}

          {galleryState === 'empty-filter' && (
            <div className="text-center py-20">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)' }}
              >
                <Filter size={24} style={{ color: 'var(--cosmic-light)' }} />
              </div>
              <p className="text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-title)' }}>
                Nenhum {filter === 'video' ? 'vídeo' : 'foto'} ainda
              </p>
              <p className="text-muted text-sm mb-5">
                Ainda não há {filter === 'video' ? 'vídeos' : 'fotos'} aprovados nesta galeria.
              </p>
              <button onClick={() => setFilter('all')} className="btn btn-secondary">
                Ver todas as memórias
              </button>
            </div>
          )}

          {/* Grid */}
          {galleryState === 'ok' && media.length > 0 && (
            <>
              <div
                className="media-grid"
                role="list"
                aria-label="Galeria de fotos e vídeos"
                style={{ marginTop: '1rem' }}
              >
                {media.map((item, index) => {
                  const isLiked = likedIds.has(item.id)
                  return (
                    <div
                      key={item.id}
                      className="media-item group relative overflow-hidden rounded-xl cursor-pointer"
                      role="listitem"
                      onClick={() => openLightbox(index)}
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && openLightbox(index)}
                      aria-label={`${item.media_type === 'video' ? 'Vídeo' : 'Foto'} de ${item.uploader_name}`}
                    >
                      {item.media_type === 'video' ? (
                        <div
                          className="relative w-full h-full overflow-hidden"
                          style={{ paddingBottom: '75%', background: '#0a0e1a' }}
                        >
                          {/* Real video thumbnail */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`/api/media/${item.id}/thumbnail`}
                            alt={`Vídeo de ${item.uploader_name}`}
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.opacity = '0'
                            }}
                          />
                          {/* Play overlay button */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/15 transition-all">
                            <div
                              className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform"
                              style={{
                                background: 'rgba(244,208,63,0.9)',
                                backdropFilter: 'blur(4px)',
                              }}
                            >
                              <Play size={18} fill="#0d0421" style={{ color: '#0d0421', marginLeft: '2px' }} />
                            </div>
                          </div>
                          <div className="absolute bottom-2 left-2 z-10">
                            <span className="badge badge-video text-[10px]">
                              <Film size={10} /> Vídeo
                            </span>
                          </div>
                        </div>
                      ) : (
                        // Photo thumbnail
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`/api/media/${item.id}/thumbnail`}
                          alt={`Foto de ${item.uploader_name}`}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      )}

                      {/* Caption icon if present */}
                      {item.caption && (
                        <div
                          className="absolute top-2 left-2 z-10 p-1.5 rounded-full"
                          style={{
                            background: 'rgba(6,10,24,0.75)',
                            backdropFilter: 'blur(4px)',
                            border: '1px solid rgba(244,208,63,0.3)',
                          }}
                          title="Contém legenda"
                        >
                          <MessageSquareQuote size={12} style={{ color: 'var(--star-gold)' }} />
                        </div>
                      )}

                      {/* Heart (Like) button on card */}
                      <button
                        onClick={(e) => toggleReaction(item.id, e)}
                        className={`absolute top-2 right-2 z-10 p-1.5 rounded-full transition-all duration-200 ${
                          isLiked
                            ? 'bg-rose-500/80 text-white shadow-md shadow-rose-500/30 scale-105'
                            : 'bg-black/50 text-white/80 hover:text-rose-400 hover:scale-110'
                        }`}
                        aria-label="Curtir foto"
                      >
                        <Heart
                          size={14}
                          fill={isLiked ? '#fff' : 'none'}
                          color={isLiked ? '#fff' : 'currentColor'}
                        />
                      </button>

                      {/* Overlay footer */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5"
                        style={{
                          background: 'linear-gradient(to top, rgba(3,7,18,0.92) 0%, rgba(3,7,18,0.3) 50%, transparent 100%)',
                        }}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <p className="font-semibold truncate mr-2" style={{ color: 'var(--star-gold)' }}>
                            {item.uploader_name}
                          </p>
                          {(item.likes_count || 0) > 0 && (
                            <span className="flex items-center gap-1 text-[11px] font-medium text-rose-300">
                              <Heart size={10} fill="#f43f5e" color="#f43f5e" />
                              {item.likes_count}
                            </span>
                          )}
                        </div>
                        {item.caption && (
                          <p className="text-[11px] text-star-silver italic truncate mt-0.5 opacity-90">
                            &ldquo;{item.caption}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
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
