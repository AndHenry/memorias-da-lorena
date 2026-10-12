'use client'

import React from 'react'
import Link from 'next/link'
import {
  Sparkles,
  GlassWater,
  Utensils,
  Crown,
  Heart,
  Music,
  Cake,
  Clock,
  Camera,
  Star,
  Compass,
  ArrowRight,
  ChevronRight,
} from 'lucide-react'

interface TimelineEvent {
  id: string
  time: string
  title: string
  constellation: string
  description: string
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>
  badgeText: string
  isHighlight?: boolean
  color: 'gold' | 'pink' | 'purple' | 'cyan'
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'recepcao',
    time: '19:30',
    title: 'RECEPÇÃO DOS CONVIDADOS',
    constellation: 'Constelação das Boas-Vindas',
    description: 'Boas-vindas calorosas, welcome drink especial e primeiros registros no painel de fotos na entrada.',
    icon: GlassWater,
    badgeText: 'Início da Noite',
    color: 'gold',
  },
  {
    id: 'coquetel',
    time: '20:30',
    title: 'SERVIÇO DE COQUETEL',
    constellation: 'Nebulosa dos Sabores',
    description: 'Salgados finos gourmet e finger foods selecionados para abrir o apetite e celebrar entre amigos e família.',
    icon: Utensils,
    badgeText: 'Gastronomia',
    color: 'purple',
  },
  {
    id: 'entrada',
    time: '21:30',
    title: 'ENTRADA TRIUNFAL DA LORENA',
    constellation: 'O Brilho da Supernova',
    description: 'O momento mais esperado e radiante da noite! Apresentação da debutante, homenagens carinhosas e o clipe retrospectiva.',
    icon: Crown,
    badgeText: 'Momento Principal ✨',
    isHighlight: true,
    color: 'gold',
  },
  {
    id: 'valsa',
    time: '22:00',
    title: 'A TRADICIONAL VALSA',
    constellation: 'Dança Cósmica das Estrelas',
    description: 'A emocionante dança da Lorena com o pai e cortejo, seguida do grande brinde comemorativo de abertura da pista.',
    icon: Heart,
    badgeText: 'Tradição & Emoção',
    color: 'pink',
  },
  {
    id: 'jantar',
    time: '22:30',
    title: 'JANTAR',
    constellation: 'Banquete Celestial',
    description: 'Serviço completo do prato principal preparado especialmente para todos os convidados desfrutarem com conforto.',
    icon: Utensils,
    badgeText: 'Jantar',
    color: 'purple',
  },
  {
    id: 'pista',
    time: '23:30',
    title: 'ABERTURA DA PISTA COM DJ',
    constellation: 'Galáxia em Festa',
    description: 'Muita música boa, jogo de luzes, adereços divertidos e animação total na pista pra todo mundo curtir e dançar!',
    icon: Music,
    badgeText: 'Pista Liberada 🎶',
    isHighlight: true,
    color: 'pink',
  },
  {
    id: 'doces',
    time: '00:30',
    title: 'MESA DE DOCES & PARABÉNS',
    constellation: 'Universo Doce',
    description: 'Corte oficial do bolo de 15 anos, canto dos parabéns com muitos aplausos e liberação da requintada mesa de doces.',
    icon: Cake,
    badgeText: 'Parabéns & Doçura',
    color: 'gold',
  },
]

export default function CronogramaTimeline() {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      {/* ── Banner Estelar do Cronograma ── */}
      <div className="text-center mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-4 glass-card-gold text-amber-300">
          <Sparkles size={14} className="animate-spin text-amber-400" style={{ animationDuration: '6s' }} />
          <span>Guia Cósmico da Noite</span>
          <Sparkles size={14} className="animate-spin text-amber-400" style={{ animationDuration: '6s' }} />
        </div>

        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3 text-gradient-gold"
          style={{ fontFamily: 'var(--font-title)' }}
        >
          O Cronograma da Lorena
        </h2>

        <p
          className="text-lg sm:text-xl font-light italic mb-4"
          style={{ color: 'var(--aurora-pink)', fontFamily: 'var(--font-title)' }}
        >
          15 ANOS &nbsp;|&nbsp; UMA NOITE ESTRELADA 🌌
        </p>

        <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto leading-relaxed">
          Cada estação desta jornada foi preparada com muito carinho. Acompanhe a trajetória das estrelas ao longo da noite!
        </p>

        <div className="divider-gold mt-6" />
      </div>

      {/* ── Trajeto Cronológico Cósmico (Timeline) ── */}
      <div className="relative">
        {/* Linha cósmica central/lateral conectando os marcos */}
        <div
          aria-hidden="true"
          className="absolute left-6 sm:left-1/2 top-4 bottom-8 -translate-x-1/2 w-0.5 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, #f4d03f 0%, #c77ddf 35%, #7c3aed 70%, #f4d03f 100%)',
            boxShadow: '0 0 15px rgba(244, 208, 63, 0.4)',
          }}
        />

        <div className="space-y-8 sm:space-y-12">
          {TIMELINE_EVENTS.map((event, index) => {
            const Icon = event.icon
            const isEven = index % 2 === 0

            return (
              <div
                key={event.id}
                className={`relative flex flex-col sm:flex-row items-start ${
                  isEven ? 'sm:flex-row-reverse' : ''
                } gap-6 group`}
              >
                {/* ── Nó Central Estelar (Ícone / Planeta da Etapa) ── */}
                <div
                  className="absolute left-6 sm:left-1/2 -translate-x-1/2 z-20 flex items-center justify-center"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      event.isHighlight
                        ? 'scale-110 shadow-lg shadow-amber-400/40 border-2 border-amber-300'
                        : 'border border-white/20 hover:border-amber-400/60'
                    }`}
                    style={{
                      background: event.isHighlight
                        ? 'linear-gradient(135deg, rgba(244,208,63,0.35), rgba(124,58,237,0.4))'
                        : 'rgba(10, 14, 30, 0.9)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <Icon
                      size={20}
                      style={{
                        color: event.isHighlight ? 'var(--star-gold)' : '#dde6f7',
                      }}
                    />
                  </div>

                  {/* Efeito de anel orbital pulsante */}
                  {event.isHighlight && (
                    <div
                      className="absolute inset-0 rounded-full animate-ping pointer-events-none opacity-40"
                      style={{ border: '2px solid var(--star-gold)' }}
                    />
                  )}
                </div>

                {/* ── Card do Marco Cronológico ── */}
                <div
                  className={`w-full sm:w-[calc(50%-2.5rem)] pl-16 sm:pl-0 ${
                    isEven ? 'sm:text-right' : 'sm:text-left'
                  }`}
                >
                  <div
                    className={`p-6 rounded-2xl transition-all duration-300 ${
                      event.isHighlight
                        ? 'glass-card-gold shadow-xl shadow-amber-500/10 border-amber-400/40 hover:border-amber-300'
                        : 'glass-card hover:border-white/20'
                    }`}
                  >
                    {/* Cabeçalho do Card: Horário & Badge */}
                    <div
                      className={`flex flex-wrap items-center gap-2 mb-2 ${
                        isEven ? 'sm:justify-end' : 'sm:justify-start'
                      }`}
                    >
                      {/* Horário */}
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-bold shadow-inner"
                        style={{
                          background: 'rgba(244, 208, 63, 0.15)',
                          color: 'var(--star-gold)',
                          border: '1px solid rgba(244, 208, 63, 0.3)',
                        }}
                      >
                        <Clock size={13} />
                        <span>{event.time}</span>
                      </span>

                      {/* Tag Temática */}
                      <span
                        className="text-[11px] font-medium uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                        style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          color: event.color === 'pink' ? 'var(--aurora-pink)' : 'rgba(221,230,247,0.7)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        {event.badgeText}
                      </span>
                    </div>

                    {/* Constelação (Subtítulo Cósmico) */}
                    <p
                      className="text-xs font-semibold uppercase tracking-widest mb-1"
                      style={{ color: 'var(--aurora-pink)' }}
                    >
                      {event.constellation}
                    </p>

                    {/* Título da Atração */}
                    <h3
                      className="text-lg sm:text-xl font-bold mb-2 text-white"
                      style={{ fontFamily: 'var(--font-title)' }}
                    >
                      {event.title}
                    </h3>

                    {/* Descrição */}
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light mb-4">
                      {event.description}
                    </p>

                    {/* Ação rápida para enviar foto desse momento */}
                    <div
                      className={`pt-2 border-t border-white/5 flex items-center ${
                        isEven ? 'sm:justify-end' : 'sm:justify-start'
                      }`}
                    >
                      <Link
                        href="/identificacao"
                        className="inline-flex items-center gap-1.5 text-xs text-amber-300/80 hover:text-amber-300 transition-colors group-hover:translate-x-1"
                      >
                        <Camera size={13} />
                        <span>Registrar foto deste momento</span>
                        <ChevronRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Espaço vazio para manter alinhamento no desktop */}
                <div className="hidden sm:block sm:w-[calc(50%-2.5rem)]" />
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Dica & Chamada de Ação Final ── */}
      <div className="mt-16 text-center glass-card p-6 sm:p-8 border border-amber-400/20 shadow-xl">
        <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center bg-amber-400/10 border border-amber-400/30">
          <Star size={26} className="text-amber-400" />
        </div>
        <h3
          className="text-xl sm:text-2xl font-bold mb-2 text-white"
          style={{ fontFamily: 'var(--font-title)', color: 'var(--star-gold)' }}
        >
          Viva Cada Instante Estelar!
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mb-6 leading-relaxed">
          Os horários são aproximados para garantir que todos aproveitem a noite ao máximo. Não esqueça de eternizar cada momento no álbum!
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/identificacao" className="btn btn-primary px-6 py-3 text-sm flex items-center justify-center gap-2">
            <Camera size={18} />
            <span>Enviar Minhas Lembranças</span>
          </Link>
          <Link href="/galeria" className="btn btn-secondary px-6 py-3 text-sm flex items-center justify-center gap-2">
            <Sparkles size={16} />
            <span>Ver a Galeria</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
