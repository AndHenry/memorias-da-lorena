'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  GlassWater,
  Utensils,
  Crown,
  Heart,
  Music,
  Cake,
  Camera,
  Star,
  ChevronRight,
} from 'lucide-react'

/* ─── Dados do Cronograma ──────────────────────────────── */

interface ScheduleItem {
  id: string
  startHour: number
  startMinute: number
  time: string
  title: string
  constellation: string
  description: string
  Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties; className?: string }>
  badge: string
  isHighlight?: boolean
}

const SCHEDULE: ScheduleItem[] = [
  {
    id: 'recepcao',
    startHour: 19, startMinute: 30, time: '19:30',
    title: 'RECEPÇÃO DOS CONVIDADOS',
    constellation: 'Constelação das Boas-Vindas',
    description: 'Boas-vindas calorosas, welcome drink especial e primeiros registros no painel de fotos.',
    Icon: GlassWater,
    badge: 'Início da Noite',
  },
  {
    id: 'coquetel',
    startHour: 20, startMinute: 30, time: '20:30',
    title: 'SERVIÇO DE COQUETEL',
    constellation: 'Nebulosa dos Sabores',
    description: 'Salgados finos gourmet e finger foods selecionados para abrir o apetite entre amigos e família.',
    Icon: Utensils,
    badge: 'Gastronomia',
  },
  {
    id: 'entrada',
    startHour: 21, startMinute: 30, time: '21:30',
    title: 'ENTRADA TRIUNFAL DA LORENA',
    constellation: 'O Brilho da Supernova',
    description: 'O momento mais esperado! Apresentação da debutante, homenagens carinhosas e clipe retrospectiva.',
    Icon: Crown,
    badge: '✨ Momento Principal',
    isHighlight: true,
  },
  {
    id: 'valsa',
    startHour: 22, startMinute: 0, time: '22:00',
    title: 'A TRADICIONAL VALSA',
    constellation: 'Dança Cósmica das Estrelas',
    description: 'A emocionante dança da Lorena com o pai e cortejo, seguida do grande brinde de abertura da pista.',
    Icon: Heart,
    badge: 'Tradição & Emoção',
  },
  {
    id: 'jantar',
    startHour: 22, startMinute: 30, time: '22:30',
    title: 'JANTAR',
    constellation: 'Banquete Celestial',
    description: 'Serviço completo do prato principal preparado especialmente para todos os convidados.',
    Icon: Utensils,
    badge: 'Jantar',
  },
  {
    id: 'pista',
    startHour: 23, startMinute: 30, time: '23:30',
    title: 'ABERTURA DA PISTA COM DJ',
    constellation: 'Galáxia em Festa',
    description: 'Muita música boa, jogo de luzes, adereços divertidos e animação total na pista!',
    Icon: Music,
    badge: '🎶 Pista Liberada',
    isHighlight: true,
  },
  {
    id: 'doces',
    startHour: 0, startMinute: 30, time: '00:30',
    title: 'MESA DE DOCES & PARABÉNS',
    constellation: 'Universo Doce',
    description: 'Corte oficial do bolo de 15 anos, canto dos parabéns e liberação da mesa de doces.',
    Icon: Cake,
    badge: 'Parabéns & Doçura',
  },
]

/* ─── Lógica: evento ativo ─────────────────────────────── */

const EVENT_DAY = 17
const EVENT_MONTH = 9   // 0-indexed (outubro)
const EVENT_YEAR = 2026

function getActiveId(): string | null {
  const now = new Date()
  if (
    now.getFullYear() !== EVENT_YEAR ||
    now.getMonth() !== EVENT_MONTH ||
    now.getDate() !== EVENT_DAY
  ) return null

  const norm = (h: number, m: number) => (h < 5 ? (h + 24) * 60 + m : h * 60 + m)
  const nowM = norm(now.getHours(), now.getMinutes())

  let activeId: string | null = null
  for (const item of SCHEDULE) {
    if (nowM >= norm(item.startHour, item.startMinute)) activeId = item.id
  }
  return activeId
}

/* ─── Componente ───────────────────────────────────────── */

export default function CronogramaTimeline() {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    setActiveId(getActiveId())
    const id = setInterval(() => setActiveId(getActiveId()), 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6">

      {/* ── Cabeçalho ── */}
      <div className="text-center mb-10">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-4"
          style={{
            background: 'rgba(244,208,63,0.08)',
            border: '1px solid rgba(244,208,63,0.25)',
            color: 'var(--star-gold)',
          }}
        >
          <Sparkles size={13} />
          Guia Cósmico da Noite
          <Sparkles size={13} />
        </div>

        <h2
          className="text-3xl sm:text-4xl font-bold mb-2 text-gradient-gold"
          style={{ fontFamily: 'var(--font-title)' }}
        >
          O Cronograma da Lorena
        </h2>
        <p className="italic text-lg mb-4" style={{ color: 'var(--aurora-pink)', fontFamily: 'var(--font-title)' }}>
          15 ANOS &nbsp;|&nbsp; UMA NOITE ESTRELADA 🌌
        </p>
        <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
          Cada estação foi preparada com muito carinho. Acompanhe a trajetória das estrelas ao longo da noite!
        </p>
        <div className="divider-gold mt-6" />
      </div>

      {/* ── Timeline ── */}
      {/*
        Layout via CSS Grid: 3 colunas
          col 1 (horário)  |  col 2 (linha+nó)  |  col 3 (card)
        Isso garante alinhamento perfeito em qualquer tela.
      */}
      <div
        className="relative"
        style={{
          display: 'grid',
          gridTemplateColumns: '3.5rem 2.5rem 1fr',
          rowGap: '1.5rem',
          columnGap: 0,
        }}
      >
        {SCHEDULE.map((item, index) => {
          const isActive = item.id === activeId
          const { Icon } = item

          return (
            <React.Fragment key={item.id}>

              {/* Col 1 — Horário */}
              <div
                className="flex items-start justify-end pr-2 pt-4"
                style={{ gridColumn: '1', gridRow: `${index + 1}` }}
              >
                <span
                  className="text-xs font-bold tabular-nums"
                  style={{ color: isActive ? 'var(--star-gold)' : 'rgba(221,230,247,0.45)' }}
                >
                  {item.time}
                </span>
              </div>

              {/* Col 2 — Nó + segmento de linha */}
              <div
                className="flex flex-col items-center"
                style={{ gridColumn: '2', gridRow: `${index + 1}` }}
              >
                {/* Linha acima do nó (exceto no primeiro) */}
                {index > 0 && (
                  <div
                    style={{
                      width: '2px',
                      height: '1rem',
                      background: 'linear-gradient(to bottom, rgba(124,58,237,0.6), rgba(244,208,63,0.5))',
                      flexShrink: 0,
                    }}
                  />
                )}
                {index === 0 && <div style={{ height: '1rem' }} />}

                {/* Nó */}
                <div
                  className="relative flex-shrink-0"
                  style={{ zIndex: 10 }}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive ? 'scale-110' : item.isHighlight ? 'scale-105' : ''
                    }`}
                    style={{
                      background: isActive
                        ? 'linear-gradient(135deg, rgba(244,208,63,0.4), rgba(124,58,237,0.4))'
                        : item.isHighlight
                        ? 'rgba(244,208,63,0.1)'
                        : 'rgba(10,14,30,0.95)',
                      border: isActive
                        ? '2px solid #f4d03f'
                        : item.isHighlight
                        ? '1px solid rgba(244,208,63,0.35)'
                        : '1px solid rgba(255,255,255,0.12)',
                      boxShadow: isActive ? '0 0 18px rgba(244,208,63,0.6)' : 'none',
                    }}
                  >
                    <Icon
                      size={16}
                      style={{ color: isActive ? '#f4d03f' : item.isHighlight ? '#f4d03f' : '#dde6f7' }}
                      className={isActive ? 'animate-pulse' : ''}
                    />
                  </div>
                  {isActive && (
                    <div
                      className="absolute inset-0 rounded-full animate-ping pointer-events-none"
                      style={{ border: '2px solid rgba(244,208,63,0.55)', opacity: 0.5 }}
                    />
                  )}
                </div>

                {/* Linha abaixo do nó (exceto no último) */}
                {index < SCHEDULE.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      minHeight: '1rem',
                      width: '2px',
                      background: 'linear-gradient(to bottom, rgba(244,208,63,0.5), rgba(124,58,237,0.6))',
                    }}
                  />
                )}
              </div>

              {/* Col 3 — Card */}
              <div
                className="pl-3 pt-2"
                style={{ gridColumn: '3', gridRow: `${index + 1}` }}
              >
                <div
                  className={`rounded-2xl p-4 transition-all duration-300 ${
                    isActive ? 'glass-card-gold shadow-lg shadow-amber-400/15' : 'glass-card'
                  }`}
                  style={{
                    border: isActive
                      ? '1px solid rgba(244,208,63,0.45)'
                      : item.isHighlight
                      ? '1px solid rgba(244,208,63,0.18)'
                      : undefined,
                  }}
                >
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    <span
                      className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{
                        background: 'rgba(244,208,63,0.08)',
                        color: 'rgba(244,208,63,0.8)',
                        border: '1px solid rgba(244,208,63,0.18)',
                      }}
                    >
                      {item.badge}
                    </span>
                    {isActive && (
                      <span
                        className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full animate-pulse"
                        style={{
                          background: 'rgba(34,197,94,0.12)',
                          color: '#22c55e',
                          border: '1px solid rgba(34,197,94,0.25)',
                        }}
                      >
                        ● Agora
                      </span>
                    )}
                  </div>

                  {/* Constelação */}
                  <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--aurora-pink)' }}>
                    {item.constellation}
                  </p>

                  {/* Título */}
                  <h3
                    className="text-sm sm:text-base font-bold text-white mb-2 leading-snug"
                    style={{ fontFamily: 'var(--font-title)' }}
                  >
                    {item.title}
                  </h3>

                  {/* Descrição */}
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {item.description}
                  </p>

                  {/* Link fotos */}
                  <div className="border-t border-white/10 pt-2.5">
                    <Link
                      href="/identificacao"
                      className="inline-flex items-center gap-1.5 text-xs text-amber-300/70 hover:text-amber-300 transition-colors"
                    >
                      <Camera size={12} />
                      <span>Registrar foto deste momento</span>
                      <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>

            </React.Fragment>
          )
        })}
      </div>

      {/* ── CTA Final ── */}
      <div
        className="text-center glass-card"
        style={{
          marginTop: '2.5rem',
          padding: '2rem 1.5rem',
          border: '1px solid rgba(244,208,63,0.25)',
        }}
      >
        <div
          className="w-12 h-12 rounded-full mx-auto flex items-center justify-center"
          style={{
            background: 'rgba(244,208,63,0.1)',
            border: '1px solid rgba(244,208,63,0.3)',
            marginBottom: '1rem',
          }}
        >
          <Star size={22} style={{ color: 'var(--star-gold)' }} />
        </div>

        <h3
          className="text-xl sm:text-2xl font-bold"
          style={{
            fontFamily: 'var(--font-title)',
            color: 'var(--star-gold)',
            marginBottom: '1rem',
          }}
        >
          Viva Cada Instante Estelar!
        </h3>

        <p
          className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed"
          style={{ marginBottom: '1.5rem' }}
        >
          Horários aproximados. Não esqueça de eternizar cada momento no álbum!
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            maxWidth: '380px',
            margin: '0 auto',
          }}
        >
          <Link
            href="/identificacao"
            className="btn btn-primary w-full text-sm sm:text-base flex items-center justify-center gap-2"
            style={{ minHeight: '52px', padding: '0.875rem 1.5rem' }}
          >
            <Camera size={18} />
            <span>Enviar Minhas Lembranças</span>
          </Link>

          <Link
            href="/galeria"
            className="btn btn-secondary w-full text-sm sm:text-base flex items-center justify-center gap-2"
            style={{
              minHeight: '52px',
              padding: '0.875rem 1.5rem',
              border: '1px solid rgba(244,208,63,0.35)',
              color: 'var(--star-gold)',
            }}
          >
            <Sparkles size={16} />
            <span>Ver a Galeria</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
