'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Star, ChevronRight, ArrowLeft, Sparkles } from 'lucide-react'
import Link from 'next/link'
import StarField from '@/components/ui/StarField'
import { useGuest } from '@/hooks/useGuest'
import { validateGuestName } from '@/lib/validations'

export default function IdentificacaoPage() {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { guest, setGuest } = useGuest()
  const router = useRouter()

  // Already identified → skip
  useEffect(() => {
    if (guest) router.replace('/enviar')
  }, [guest, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const nameValidation = validateGuestName(name)
    if (!nameValidation.valid) {
      setError(nameValidation.error!)
      return
    }

    setIsSubmitting(true)
    try {
      setGuest(name.trim())
      router.push('/enviar')
    } catch {
      setError('Ocorreu um erro. Tente novamente.')
      setIsSubmitting(false)
    }
  }

  return (
    <main className="page-wrapper">
      <StarField count={100} />

      <div className="min-h-screen flex flex-col items-center justify-center px-5 py-12" style={{ padding: '3rem 1.25rem' }}>
        <div className="w-full max-w-md animate-slide-up flex flex-col" style={{ gap: '1.25rem' }}>
          {/* Back */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted text-sm hover:text-gold transition-colors"
            style={{ color: 'rgba(221,230,247,0.5)', display: 'inline-flex', marginBottom: '0.25rem' }}
          >
            <ArrowLeft size={16} />
            Voltar ao início
          </Link>

          {/* Card */}
          <div className="glass-card p-6 sm:p-8 flex flex-col" style={{ gap: '1.5rem' }}>
            {/* Header */}
            <div className="text-center" style={{ marginBottom: '0.25rem' }}>
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto pulse-gold"
                style={{
                  background: 'rgba(244,208,63,0.1)',
                  border: '1px solid rgba(244,208,63,0.3)',
                  marginBottom: '1rem',
                }}
              >
                <User size={28} style={{ color: 'var(--star-gold)' }} />
              </div>
              <h1 className="heading-md" style={{ fontFamily: 'var(--font-title)', color: 'var(--star-gold)', marginBottom: '0.5rem' }}>
                Quem é você?
              </h1>
              <p className="text-muted text-sm">
                Informe seu nome para que suas memórias sejam identificadas na galeria.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Name Input Div */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="guest-name" className="label-field" style={{ marginBottom: 0 }}>
                  Seu nome ou apelido
                </label>
                <input
                  id="guest-name"
                  type="text"
                  className="input-field"
                  placeholder="Ex: Maria, Tia Ju, Rodrigo..."
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError('') }}
                  maxLength={80}
                  autoFocus
                  autoComplete="name"
                  required
                  aria-describedby={error ? 'name-error' : undefined}
                />
                {error && (
                  <p id="name-error" className="text-sm" style={{ color: '#f87171', marginTop: '0.25rem' }} role="alert">
                    {error}
                  </p>
                )}
              </div>

              {/* Comunicado do Projeto da Lorena */}
              <div
                className="rounded-xl flex items-start gap-3"
                style={{
                  background: 'rgba(244, 208, 63, 0.05)',
                  border: '1px solid rgba(244, 208, 63, 0.2)',
                  padding: '1rem',
                }}
              >
                <Sparkles size={20} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--star-gold)' }} />
                <div className="text-xs leading-relaxed" style={{ color: 'rgba(221,230,247,0.85)' }}>
                  <strong className="block font-semibold mb-1" style={{ color: 'var(--star-gold)' }}>
                    Comunicado — Memórias da Lorena
                  </strong>
                  As fotos e vídeos compartilhados serão utilizados exclusivamente no álbum digital da festa de 15 anos de Lorena Rayla, gerenciado com carinho pela família.
                </div>
              </div>

              {/* Submit Button Div */}
              <div>
                <button
                  type="submit"
                  id="submit-identification"
                  className="btn btn-primary w-full"
                  disabled={isSubmitting || !name.trim()}
                >
                  {isSubmitting ? (
                    <>Entrando...</>
                  ) : (
                    <>
                      <Star size={18} />
                      Entrar no álbum
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Note Div */}
            <div style={{ paddingTop: '0.25rem' }}>
              <p className="text-center text-xs text-muted leading-relaxed">
                Não é necessário criar uma conta ou senha. <br />
                Sua identificação é usada apenas para organizar as memórias.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
