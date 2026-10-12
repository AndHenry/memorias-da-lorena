'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Star, ChevronRight, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import StarField from '@/components/ui/StarField'
import { useGuest } from '@/hooks/useGuest'
import { validateGuestName } from '@/lib/validations'

export default function IdentificacaoPage() {
  const [name, setName] = useState('')
  const [accepted, setAccepted] = useState(false)
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

    if (!accepted) {
      setError('Por favor, aceite os termos antes de continuar.')
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

      <div className="min-h-screen flex flex-col items-center justify-center px-5 py-16">
        <div className="w-full max-w-md animate-slide-up">
          {/* Back */}
          <Link href="/" className="inline-flex items-center gap-2 text-muted text-sm hover:text-gold mb-8 transition-colors"
            style={{ color: 'rgba(221,230,247,0.5)' }}>
            <ArrowLeft size={16} />
            Voltar ao início
          </Link>

          {/* Card */}
          <div className="glass-card p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 pulse-gold"
                style={{
                  background: 'rgba(244,208,63,0.1)',
                  border: '1px solid rgba(244,208,63,0.3)',
                }}
              >
                <User size={28} style={{ color: 'var(--star-gold)' }} />
              </div>
              <h1 className="heading-md mb-2" style={{ fontFamily: 'var(--font-title)', color: 'var(--star-gold)' }}>
                Quem é você?
              </h1>
              <p className="text-muted text-sm">
                Informe seu nome para que suas memórias sejam identificadas na galeria.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-6">
                <label htmlFor="guest-name" className="label-field">
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
                  <p id="name-error" className="mt-2 text-sm" style={{ color: '#f87171' }} role="alert">
                    {error}
                  </p>
                )}
              </div>

              {/* Privacy Accept */}
              <div className="mb-8">
                <label className="checkbox-custom">
                  <input
                    type="checkbox"
                    id="accept-terms"
                    checked={accepted}
                    onChange={(e) => { setAccepted(e.target.checked); setError('') }}
                  />
                  <span className="text-sm text-muted leading-relaxed">
                    Entendo que as fotos enviadas serão utilizadas exclusivamente no álbum digital da festa de Lorena Rayla,
                    gerenciado pela família, conforme o{' '}
                    <span style={{ color: 'var(--star-gold)' }}>aviso de privacidade</span>.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                id="submit-identification"
                className="btn btn-primary w-full"
                disabled={isSubmitting || !name.trim() || !accepted}
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
            </form>

            {/* Note */}
            <p className="text-center text-xs text-muted mt-6">
              Não é necessário criar uma conta ou senha. <br />
              Sua identificação é usada apenas para organizar as memórias.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
