'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Star, Camera, Images, ArrowRight } from 'lucide-react'
import StarField from '@/components/ui/StarField'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useGuest } from '@/hooks/useGuest'

function EventQRCodeContent() {
  const params = useParams()
  const router = useRouter()
  const slug = (params?.slug as string) || 'lorena-rayla-xv'
  const { guest, isLoading: guestLoading } = useGuest()
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    if (guestLoading) return

    // If guest already identified, after 3 seconds redirect to /enviar or let them choose
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          if (guest) {
            router.push('/enviar')
          } else {
            router.push('/identificacao')
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [guestLoading, guest, router])

  return (
    <div className="relative z-10 w-full max-w-md text-center glass-card p-8 sm:p-10 border border-amber-400/30 shadow-2xl shadow-amber-500/10 animate-fade-in">
      {/* Glow & Icon */}
      <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center bg-amber-400/10 border border-amber-400/40 shadow-inner">
        <Star className="text-amber-400 animate-pulse" size={32} />
      </div>

      <p className="text-xs uppercase tracking-[0.25em] text-amber-300 font-semibold mb-2">
        Álbum Colaborativo Oficial
      </p>
      <h1
        className="text-2xl sm:text-3xl font-bold mb-3"
        style={{ fontFamily: 'var(--font-title)', color: 'var(--star-gold)' }}
      >
        Memórias da Lorena
      </h1>
      <p className="text-sm text-slate-300 mb-6 font-light leading-relaxed">
        Uma Noite Estrelada — 15 Anos
      </p>

      {guestLoading ? (
        <LoadingSpinner size={32} text="Carregando..." />
      ) : (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300">
            {guest ? (
              <span>
                Olá, <strong className="text-amber-300">{guest.name}</strong>! Redirecionando para envio em {countdown}s...
              </span>
            ) : (
              <span>
                Conectando você ao evento... Redirecionando em {countdown}s...
              </span>
            )}
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Link
              href={guest ? '/enviar' : '/identificacao'}
              className="btn btn-primary w-full py-3 flex items-center justify-center gap-2 font-semibold text-sm shadow-lg shadow-amber-400/20"
            >
              <Camera size={18} />
              {guest ? 'Enviar Fotos Agora' : 'Identificar-se e Enviar Fotos'}
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/galeria"
              className="btn btn-secondary w-full py-2.5 flex items-center justify-center gap-2 text-sm text-slate-300 hover:text-white"
            >
              <Images size={16} />
              Explorar Galeria
            </Link>
          </div>
        </div>
      )}

      <div className="mt-8 pt-4 border-t border-white/5">
        <p className="text-[11px] text-slate-400 font-mono">
          Evento: {slug}
        </p>
      </div>
    </div>
  )
}

export default function EventQRCodeEntry() {
  return (
    <main className="page-wrapper min-h-screen flex flex-col items-center justify-center p-5 relative overflow-hidden">
      <StarField count={120} />
      <Suspense fallback={<LoadingSpinner size={36} text="Iniciando álbum..." />}>
        <EventQRCodeContent />
      </Suspense>
    </main>
  )
}
