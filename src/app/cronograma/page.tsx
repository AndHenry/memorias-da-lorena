import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Sparkles } from 'lucide-react'
import StarField from '@/components/ui/StarField'
import CronogramaTimeline from '@/components/cronograma/CronogramaTimeline'

export const metadata: Metadata = {
  title: 'Cronograma da Festa — Memórias da Lorena',
  description: 'Confira a programação completa e o roteiro estelar dos 15 anos de Lorena Rayla.',
}

export default function CronogramaPage() {
  return (
    <main className="page-wrapper min-h-screen relative overflow-hidden pb-16">
      <StarField count={110} />

      {/* Top bar de navegação rápida */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-6 sm:pt-8 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm px-3 py-1.5 rounded-full glass-card hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
        >
          <ArrowLeft size={16} />
          <span>Voltar ao início</span>
        </Link>

        <Link
          href="/galeria"
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full glass-card hover:bg-white/10 transition-colors text-amber-300"
        >
          <Sparkles size={14} />
          <span>Ver Álbum de Fotos</span>
        </Link>
      </div>

      {/* Conteúdo do Cronograma */}
      <div className="relative z-10 pt-4">
        <CronogramaTimeline />
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-slate-400 opacity-60">
        <p>Memórias da Lorena · Uma Noite Estrelada · 17 de Outubro de 2026</p>
      </footer>
    </main>
  )
}
