'use client'

import { useEffect, useState } from 'react'
import { Camera, Film, Users, Clock, HardDrive, Images } from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { AdminStats } from '@/types/database'
import { formatBytes } from '@/lib/validations'
import { authFetch } from '@/lib/supabase/client'
import Link from 'next/link'

const EVENT_SLUG = process.env.NEXT_PUBLIC_EVENT_SLUG || 'lorena-rayla-xv'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    authFetch(`/api/admin/stats?slug=${EVENT_SLUG}`)
      .then((r) => r.json())
      .then((data) => { if (data.stats) setStats(data.stats) })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="heading-lg" style={{ fontFamily: 'var(--font-title)', color: 'var(--star-gold)' }}>
          Dashboard
        </h1>
        <p className="text-muted text-sm mt-1">Visão geral do álbum — Memórias da Lorena</p>
      </div>

      {isLoading ? (
        <LoadingSpinner size={36} text="Carregando estatísticas..." className="py-16" />
      ) : stats ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <StatCard icon={<Camera size={22} />} label="Fotos" value={stats.total_photos} color="gold" />
            <StatCard icon={<Film size={22} />}   label="Vídeos" value={stats.total_videos} color="purple" />
            <StatCard icon={<Images size={22} />} label="Total de arquivos" value={stats.total_uploads} color="blue" />
            <StatCard icon={<Users size={22} />}  label="Convidados" value={stats.total_guests} color="pink" />
            <StatCard
              icon={<Clock size={22} />}
              label="Aguardando moderação"
              value={stats.pending_moderation}
              color={stats.pending_moderation > 0 ? 'amber' : 'green'}
              highlight={stats.pending_moderation > 0}
            />
            <StatCard
              icon={<HardDrive size={22} />}
              label="Armazenamento usado"
              value={formatBytes(stats.storage_used_bytes)}
              color="blue"
              isText
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickAction
              href="/admin/galeria"
              title="Moderar arquivos"
              description={stats.pending_moderation > 0
                ? `${stats.pending_moderation} arquivos aguardando aprovação`
                : 'Nenhum arquivo pendente'}
              urgent={stats.pending_moderation > 0}
            />
            <QuickAction
              href="/admin/configuracoes"
              title="Configurações"
              description="Gerenciar upload, galeria e permissões"
            />
            <QuickAction
              href="/admin/qrcode"
              title="QR Code"
              description="Baixar QR Code para pulseiras"
            />
          </div>
        </>
      ) : (
        <div className="glass-card p-8 text-center">
          <p className="text-muted">Não foi possível carregar as estatísticas.</p>
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  color,
  highlight,
  isText,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  color: 'gold' | 'purple' | 'blue' | 'pink' | 'amber' | 'green'
  highlight?: boolean
  isText?: boolean
}) {
  const colors = {
    gold:   { bg: 'rgba(244,208,63,0.08)',  border: 'rgba(244,208,63,0.2)',  icon: 'var(--star-gold)' },
    purple: { bg: 'rgba(124,58,237,0.08)',  border: 'rgba(124,58,237,0.2)',  icon: 'var(--cosmic-light)' },
    blue:   { bg: 'rgba(99,102,241,0.08)',  border: 'rgba(99,102,241,0.2)',  icon: '#818cf8' },
    pink:   { bg: 'rgba(236,72,153,0.08)',  border: 'rgba(236,72,153,0.2)',  icon: '#f472b6' },
    amber:  { bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.3)',  icon: '#fbbf24' },
    green:  { bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.2)',   icon: '#22c55e' },
  }
  const c = colors[color]

  return (
    <div
      className="glass-card p-5 flex items-start gap-4"
      style={highlight ? { borderColor: c.border, boxShadow: `0 0 20px ${c.bg}` } : {}}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: c.bg, border: `1px solid ${c.border}` }}>
        <span style={{ color: c.icon }}>{icon}</span>
      </div>
      <div>
        <p className="text-muted text-xs font-medium mb-1">{label}</p>
        <p className="text-2xl font-bold" style={{ color: 'var(--star-silver)' }}>
          {isText ? value : value.toLocaleString('pt-BR')}
        </p>
      </div>
    </div>
  )
}

function QuickAction({ href, title, description, urgent }: {
  href: string; title: string; description: string; urgent?: boolean
}) {
  return (
    <Link href={href} className="glass-card p-5 block transition-all hover:scale-[1.01]"
      style={urgent ? { borderColor: 'rgba(251,191,36,0.3)' } : {}}>
      <h3 className="font-semibold mb-1" style={{ color: urgent ? '#fbbf24' : 'var(--star-silver)' }}>
        {title}
      </h3>
      <p className="text-muted text-sm">{description}</p>
    </Link>
  )
}
