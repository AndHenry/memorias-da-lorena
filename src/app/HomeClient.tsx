'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Camera, Images, Star, MapPin, Calendar, Clock, ChevronDown, Heart, Shield, Sparkles, ChevronRight } from 'lucide-react'
import StarField from '@/components/ui/StarField'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import CronogramaTimeline from '@/components/cronograma/CronogramaTimeline'

interface EventStats {
  totalPhotos: number
  totalVideos: number
  totalGuests: number
}

export default function HomeClient() {
  const [activeTab, setActiveTab] = useState<'memorias' | 'cronograma'>('memorias')
  const [stats, setStats] = useState<EventStats | null>(null)
  const [uploadEnabled, setUploadEnabled] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const eventDate = new Date('2026-10-17T22:30:00-03:00')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('tab') === 'cronograma' || window.location.hash === '#cronograma') {
        setActiveTab('cronograma')
      }
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    fetch('/api/event/stats')
      .then((r) => r.json())
      .then((data) => {
        if (data.stats) setStats(data.stats)
        if (typeof data.uploadEnabled === 'boolean') setUploadEnabled(data.uploadEnabled)
      })
      .catch(() => {})
  }, [])

  const formatDate = () =>
    eventDate.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

  return (
    <main className="page-wrapper min-h-screen">
      <StarField count={140} />

      {/* ── BARRA FLUTUANTE DE SELEÇÃO: MEMÓRIAS OU CRONOGRAMA ── */}
      <header className="sticky top-3 sm:top-5 z-40 w-full px-3 sm:px-4 flex justify-center pt-2">
        <nav
          aria-label="Escolher visualização"
          className="glass-card px-1.5 py-1.5 rounded-full flex items-center gap-1 shadow-2xl shadow-black/80 border border-white/10"
          style={{ background: 'rgba(6, 10, 24, 0.88)', backdropFilter: 'blur(20px)' }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('memorias')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className={`px-3.5 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'memorias'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30 scale-100 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Images size={15} />
            <span>Álbum de Fotos</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('cronograma')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className={`px-3.5 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'cronograma'
                ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 text-white shadow-md shadow-pink-500/30 scale-100 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Clock size={15} />
            <span>Cronograma da Festa</span>
          </button>
        </nav>
      </header>


      {/* ── VISUALIZAÇÃO: CRONOGRAMA ── */}
      {activeTab === 'cronograma' && (
        <section className="pb-20" style={{ paddingTop: '5rem' }}>
          <CronogramaTimeline />
        </section>
      )}


      {/* ── VISUALIZAÇÃO: ÁLBUM DE MEMÓRIAS ── */}
      {activeTab === 'memorias' && (
        <>
          {/* ── HERO SECTION ─────────────────────────────── */}
          <section className="relative min-h-screen flex flex-col items-center justify-center px-5 pt-16 pb-24 text-center">
            {/* Decorative ring */}
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
          <div
            style={{
              width: 'min(600px, 90vw)',
              height: 'min(600px, 90vw)',
              borderRadius: '50%',
              border: '1px solid rgba(244,208,63,0.08)',
              animation: 'nebula-drift 30s ease-in-out infinite alternate',
            }}
          />
        </div>

        {/* Event badge */}
        <div className="glass-card-gold px-4 py-2 text-xs font-semibold tracking-widest uppercase text-gold mb-8 animate-slide-up">
          ✨ &nbsp; Festa de 15 Anos &nbsp; ✨
        </div>

        {/* Title */}
        <h1 className="heading-xl text-gradient-gold mb-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Memórias da Lorena
        </h1>

        <p
          className="font-title italic text-aurora-pink text-2xl md:text-3xl mb-6 animate-slide-up"
          style={{ color: 'var(--aurora-pink)', animationDelay: '0.15s' }}
        >
          Uma Noite Estrelada
        </p>

        <div className="divider-gold" />

        {/* Message */}
        <p
          className="text-star-silver max-w-xl mx-auto text-base md:text-lg leading-relaxed mt-6 mb-8 animate-slide-up"
          style={{ color: 'var(--star-silver)', animationDelay: '0.2s' }}
        >
          Cada sorriso, cada abraço e cada instante fazem parte de uma história única.
          Compartilhe suas fotos e ajude a eternizar essa noite especial.
        </p>

        {/* Stats */}
        {stats && (
          <div
            className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 mt-8 sm:mt-12 mb-6 sm:mb-8 animate-slide-up"
            style={{ animationDelay: '0.25s' }}
          >
            <StatPill icon={<Camera size={16} />} value={stats.totalPhotos} label="fotos" />
            <StatPill icon={<Images size={16} />} value={stats.totalVideos} label="vídeos" />
            <StatPill icon={<Heart size={16} />} value={stats.totalGuests} label="convidados" />
          </div>
        )}

        {/* CTA Buttons */}
        <div
          className="w-full max-w-sm mx-auto flex flex-col gap-4 justify-center items-stretch animate-slide-up"
          style={{ marginTop: '1rem', animationDelay: '0.3s' }}
        >
          {uploadEnabled ? (
            <Link
              href="/identificacao"
              className="btn btn-primary btn-lg w-full py-4 px-8 text-center flex items-center justify-center gap-3"
            >
              <Camera size={22} />
              <span>Enviar minhas lembranças</span>
            </Link>
          ) : (
            <div
              className="glass-card px-6 py-4 text-center"
              style={{ borderColor: 'rgba(244,208,63,0.2)' }}
            >
              <p className="text-muted text-sm">O envio de fotos foi encerrado.</p>
              <p style={{ color: 'var(--star-gold)' }} className="text-sm mt-1">
                A galeria continua disponível ✨
              </p>
            </div>
          )}
          <Link
            href="/galeria"
            className="btn btn-secondary btn-lg w-full py-4 px-8 text-center flex items-center justify-center gap-3"
          >
            <Star size={20} />
            <span>Ver galeria</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              setActiveTab('cronograma')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="btn btn-secondary btn-lg w-full py-4 px-8 flex items-center justify-center gap-3"
            style={{ borderColor: 'rgba(244,208,63,0.35)', color: 'var(--star-gold)' }}
          >
            <Sparkles size={20} />
            <span>Ver o Cronograma da Festa</span>
            <ChevronRight size={18} />
          </button>
        </div>



        {/* Scroll hint */}
        <div
          className="mt-8 flex justify-center animate-bounce"
          style={{ opacity: scrolled ? 0 : 0.6, transition: 'opacity 0.3s' }}
          aria-hidden="true"
        >
          <ChevronDown size={24} style={{ color: 'var(--star-gold)' }} />
        </div>
      </section>

      {/* ── EVENT DETAILS ──────────────────────────────── */}
      <section className="py-16 sm:py-20 px-5">
        <div className="container-app max-w-3xl mx-auto">
          <div className="glass-card p-6 sm:p-8">
            <h2 className="heading-md text-center mb-8" style={{ fontFamily: 'var(--font-title)', color: 'var(--star-gold)' }}>
              A Festa
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
              <DetailItem
                icon={<Calendar size={22} />}
                label="Data"
                value={formatDate()}
              />
              <DetailItem
                icon={<Clock size={22} />}
                label="Horário"
                value="19h30"
              />
              <DetailItem
                icon={<MapPin size={22} />}
                label="Local"
                value="Estrada Beira Rio, 911 — Caucaia do Alto, Cotia"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW TO PARTICIPATE ─────────────────────────── */}
      <section className="pt-24 pb-16 sm:pt-32 sm:pb-24 px-5">
        <div className="container-app max-w-3xl mx-auto">
          <div className="text-center pt-8 sm:pt-12 mb-10 sm:mb-14">
            <h2 className="heading-lg text-center mb-4" style={{ fontFamily: 'var(--font-title)' }}>
              Como participar
            </h2>
            <div className="divider-gold" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <StepCard
              number="1"
              title="Identifique-se"
              description="Informe seu nome para que saibamos quem compartilhou cada memória."
              icon={<Star size={24} />}
            />
            <StepCard
              number="2"
              title="Envie suas fotos"
              description="Selecione fotos e vídeos da galeria ou tire fotos direto pelo celular."
              icon={<Camera size={24} />}
            />
            <StepCard
              number="3"
              title="Veja as memórias"
              description="Explore a galeria compartilhada e reviva cada momento especial."
              icon={<Images size={24} />}
            />
          </div>
        </div>
      </section>

      {/* ── PRIVACY NOTICE ─────────────────────────────── */}
      <section className="pb-24 sm:pb-32 px-5" style={{ marginTop: '1rem', paddingTop: '1rem' }}>
        <div className="container-app max-w-2xl mx-auto">
          <div className="glass-card p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 sm:gap-6 shadow-xl">
            <div className="flex-shrink-0 p-3 rounded-2xl bg-amber-400/10 border border-amber-400/20" style={{ color: 'var(--star-gold)' }}>
              <Shield size={28} />
            </div>
            <div>
              <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--star-gold)' }}>
                Privacidade e uso das imagens
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                As fotos e vídeos enviados serão utilizados exclusivamente para compor o álbum digital da festa de Lorena Rayla.
                O álbum é administrado pela família da debutante. Para solicitar a remoção de um arquivo, entre em contato com os organizadores.
                O conteúdo será mantido por até 12 meses após o evento. Este sistema está em conformidade com a LGPD (Lei nº 13.709/2018).
              </p>
            </div>
          </div>
        </div>
      </section>
      </>
      )}

      {/* ── FOOTER ─────────────────────────────────────── */}
      <footer className="px-5 text-center text-muted text-sm border-t" style={{ borderColor: 'var(--glass-border)', paddingTop: '2rem', paddingBottom: '5rem' }}>
        <p>Feito com <span style={{ color: 'var(--aurora-pink)' }}>♥</span> para a Lorena Rayla · 17 de outubro de 2026</p>
        <p className="mt-1 opacity-50 text-xs">Memórias da Lorena — Uma Noite Estrelada</p>
      </footer>
    </main>
  )
}

function StatPill({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="glass-card px-5 py-3 flex items-center gap-2">
      <span style={{ color: 'var(--star-gold)' }}>{icon}</span>
      <span className="font-bold" style={{ color: 'var(--star-gold)' }}>{value}</span>
      <span className="text-muted text-sm">{label}</span>
    </div>
  )
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(244,208,63,0.1)', border: '1px solid rgba(244,208,63,0.2)' }}
      >
        <span style={{ color: 'var(--star-gold)' }}>{icon}</span>
      </div>
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-muted">{label}</p>
        <p className="mt-1 font-medium" style={{ color: 'var(--star-silver)' }}>{value}</p>
      </div>
    </div>
  )
}

function StepCard({
  number,
  title,
  description,
  icon,
}: {
  number: string
  title: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <div className="glass-card p-6 text-center flex flex-col items-center gap-4">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold pulse-gold"
        style={{
          background: 'linear-gradient(135deg, rgba(244,208,63,0.15), rgba(244,208,63,0.05))',
          border: '1px solid rgba(244,208,63,0.3)',
          color: 'var(--star-gold)',
        }}
      >
        {number}
      </div>
      <div style={{ color: 'var(--cosmic-light)' }}>{icon}</div>
      <h3 className="font-semibold text-lg" style={{ fontFamily: 'var(--font-title)', color: 'var(--star-silver)' }}>
        {title}
      </h3>
      <p className="text-muted text-sm leading-relaxed">{description}</p>
    </div>
  )
}
