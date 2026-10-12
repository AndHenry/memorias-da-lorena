'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  ArrowLeft,
  Heart,
  Sparkles,
  MessageSquareQuote,
  Clock,
} from 'lucide-react'
import StarField from '@/components/ui/StarField'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { celestialAudio } from '@/lib/celestial-audio'
import type { Media } from '@/types/database'

const EVENT_SLUG = process.env.NEXT_PUBLIC_EVENT_SLUG || 'lorena-rayla-xv'

export default function SlideshowPage() {
  const [photos, setPhotos] = useState<Media[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isAudioEnabled, setIsAudioEnabled] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [intervalSeconds, setIntervalSeconds] = useState(5)
  const [progress, setProgress] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch photos sorted by most liked
  useEffect(() => {
    async function loadPhotos() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/media?slug=${EVENT_SLUG}&sort=most_liked&limit=50&type=photo`)
        const data = await res.json()
        const items: Media[] = data.media || []
        setPhotos(items)
      } catch (err) {
        console.error('Erro ao carregar fotos do slideshow:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadPhotos()
  }, [])

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      celestialAudio.stop()
    }
  }, [])

  // Audio state toggle
  const toggleAudio = useCallback(() => {
    if (isAudioEnabled) {
      celestialAudio.stop()
      setIsAudioEnabled(false)
    } else {
      celestialAudio.start(0.28)
      setIsAudioEnabled(true)
    }
  }, [isAudioEnabled])

  // Navigation
  const nextSlide = useCallback(() => {
    if (photos.length === 0) return
    setCurrentIndex((prev) => (prev + 1) % photos.length)
    setProgress(0)
  }, [photos.length])

  const prevSlide = useCallback(() => {
    if (photos.length === 0) return
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)
    setProgress(0)
  }, [photos.length])

  // Start slideshow handler
  const handleStart = (withSound = true) => {
    setHasStarted(true)
    setIsPlaying(true)
    if (withSound) {
      celestialAudio.start(0.28)
      setIsAudioEnabled(true)
    }
  }

  // Timer loop for auto-advance
  useEffect(() => {
    if (!isPlaying || photos.length <= 1) return

    const stepMs = 50
    const totalMs = intervalSeconds * 1000
    const increment = (stepMs / totalMs) * 100

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide()
          return 0
        }
        return prev + increment
      })
    }, stepMs)

    return () => clearInterval(timer)
  }, [isPlaying, intervalSeconds, photos.length, nextSlide])

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault()
        setIsPlaying((p) => !p)
      } else if (e.key === 'ArrowRight') {
        nextSlide()
      } else if (e.key === 'ArrowLeft') {
        prevSlide()
      } else if (e.key === 'm' || e.key === 'M') {
        toggleAudio()
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [nextSlide, prevSlide, toggleAudio])

  const currentPhoto = photos[currentIndex]

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <StarField count={80} />
        <LoadingSpinner size={42} text="Preparando Vídeo Recordação..." />
      </main>
    )
  }

  if (photos.length === 0) {
    return (
      <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <StarField count={80} />
        <div className="glass-card p-8 max-w-md rounded-2xl border border-amber-400/20">
          <Sparkles size={40} className="mx-auto mb-4 text-amber-400" />
          <h1 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-title)', color: 'var(--star-gold)' }}>
            Nenhuma foto disponível ainda
          </h1>
          <p className="text-muted text-sm mb-6">
            Assim que os convidados enviarem fotos da festa, o Vídeo Recordação será montado automaticamente com as melhores memórias!
          </p>
          <Link href="/galeria" className="btn btn-primary w-full">
            Voltar para a Galeria
          </Link>
        </div>
      </main>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden bg-black select-none"
      style={{ fontFamily: 'var(--font-body)' }}
    >
      <StarField count={70} />

      {/* ── SPLASH DE INÍCIO COM SOM ── */}
      {!hasStarted && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md px-6">
          <div className="glass-card p-8 sm:p-10 max-w-lg w-full text-center rounded-3xl border border-amber-400/30 shadow-2xl shadow-amber-400/10">
            <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center pulse-gold bg-amber-400/15 border border-amber-400/40">
              <Sparkles size={32} className="text-amber-400" />
            </div>

            <span className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2 block">
              15 Anos · Lorena Rayla
            </span>

            <h1 className="text-2xl sm:text-3xl font-bold mb-3 text-gradient-gold" style={{ fontFamily: 'var(--font-title)' }}>
              Vídeo Recordação
            </h1>

            <p className="text-star-silver text-sm sm:text-base leading-relaxed mb-8 opacity-90">
              Apresentação automática dos momentos mais especiais e curtidos da noite, acompanhada por uma suave trilha sonora estelar.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => handleStart(true)}
                className="btn btn-primary py-3.5 px-6 flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-amber-400/20"
              >
                <Play size={18} fill="currentColor" />
                <span>Iniciar com Trilha Estelar</span>
              </button>

              <button
                onClick={() => handleStart(false)}
                className="btn btn-secondary py-3.5 px-6 flex items-center justify-center gap-2 text-sm text-slate-300"
              >
                <span>Sem som</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BARRA SUPERIOR DE PROGRESSO ── */}
      <div className="absolute top-0 left-0 right-0 z-30 h-1.5 bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-amber-400 via-pink-400 to-amber-300 transition-all duration-75"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ── BOTÃO DE SAÍDA NO TOPO ── */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
        <Link
          href="/galeria"
          className="p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/10 transition-all"
          title="Voltar para galeria"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="glass-card px-3 py-1.5 rounded-full text-xs font-semibold text-amber-300 border border-amber-400/20 bg-black/50 hidden sm:flex items-center gap-1.5">
          <Sparkles size={13} />
          <span>{currentIndex + 1} de {photos.length}</span>
        </div>
      </div>

      {/* ── IMAGEM DO SLIDESHOW COM TRANSIÇÃO KEN BURNS ── */}
      {currentPhoto && (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          {/* Imagem desfocada de fundo para preencher qualquer proporção */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={`bg-${currentPhoto.id}`}
            src={`/api/media/${currentPhoto.id}/signed-url`}
            alt=""
            className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-35 scale-110 pointer-events-none"
          />

          {/* Imagem principal com zoom cinematográfico suave */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={`slide-${currentPhoto.id}`}
            src={`/api/media/${currentPhoto.id}/signed-url`}
            alt={`Foto de ${currentPhoto.uploader_name}`}
            className="relative z-10 max-h-[88vh] max-w-[92vw] object-contain rounded-2xl shadow-2xl transition-all duration-1000 ease-out"
            style={{
              animation: 'kenburns 12s ease-out infinite alternate',
            }}
          />
        </div>
      )}

      {/* ── OVERLAY DE LEGENDA E AUTOR ── */}
      {currentPhoto && (
        <div
          className="absolute bottom-16 sm:bottom-20 left-0 right-0 z-30 px-4 flex justify-center pointer-events-none"
        >
          <div
            className="max-w-2xl w-full glass-card p-4 sm:p-5 rounded-2xl text-center border border-amber-400/25 pointer-events-auto backdrop-blur-xl shadow-2xl"
            style={{ background: 'rgba(6, 10, 24, 0.82)' }}
          >
            {/* Legenda (se houver) */}
            {currentPhoto.caption && (
              <p
                className="text-base sm:text-lg italic font-serif leading-relaxed mb-3 text-amber-100"
              >
                &ldquo;{currentPhoto.caption}&rdquo;
              </p>
            )}

            {/* Rodapé com autor e curtidas */}
            <div className="flex items-center justify-center gap-4 text-xs sm:text-sm text-slate-300">
              <span className="font-semibold text-amber-300">
                ✨ {currentPhoto.uploader_name}
              </span>

              {(currentPhoto.likes_count || 0) > 0 && (
                <span className="flex items-center gap-1 text-rose-300 font-semibold">
                  <Heart size={14} fill="#f43f5e" color="#f43f5e" />
                  {currentPhoto.likes_count}
                </span>
              )}

              <span className="text-slate-400 hidden sm:inline">
                · {new Date(currentPhoto.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── SETAS DE NAVEGAÇÃO LATERAIS ── */}
      <button
        onClick={prevSlide}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 transition-all hover:scale-110"
        aria-label="Foto anterior"
      >
        <ChevronLeft size={28} />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 transition-all hover:scale-110"
        aria-label="Próxima foto"
      >
        <ChevronRight size={28} />
      </button>

      {/* ── BARRA DE CONTROLE INFERIOR FLUTUANTE ── */}
      <div className="absolute bottom-3 left-0 right-0 z-40 flex justify-center px-4">
        <div
          className="glass-card px-4 py-2 rounded-full flex items-center gap-3 border border-white/15 bg-black/70 backdrop-blur-xl shadow-2xl"
        >
          {/* Play / Pause */}
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className="p-2 rounded-full bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 transition-all shadow-md"
            title={isPlaying ? 'Pausar (Espaço)' : 'Reproduzir (Espaço)'}
          >
            {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
          </button>

          {/* Velocidade (segundos) */}
          <div className="flex items-center gap-1 text-xs text-slate-300 border-l border-white/10 pl-3">
            <Clock size={13} className="text-amber-400" />
            {[4, 6, 8].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setIntervalSeconds(s)
                  setProgress(0)
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                  intervalSeconds === s ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' : 'hover:text-white'
                }`}
              >
                {s}s
              </button>
            ))}
          </div>

          {/* Som / Música */}
          <button
            onClick={toggleAudio}
            className={`p-2 rounded-full transition-all border ${
              isAudioEnabled
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
            title={isAudioEnabled ? 'Silenciar música (M)' : 'Ativar música celestial (M)'}
          >
            {isAudioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Tela cheia */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full text-slate-300 hover:text-white transition-all border-l border-white/10 pl-3"
            title={isFullscreen ? 'Sair da tela cheia (F)' : 'Tela cheia (F)'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Estilo Ken Burns inline */}
      <style jsx>{`
        @keyframes kenburns {
          0% {
            transform: scale(1) translate(0, 0);
          }
          100% {
            transform: scale(1.06) translate(-1%, -1%);
          }
        }
      `}</style>
    </div>
  )
}
