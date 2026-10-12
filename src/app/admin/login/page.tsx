'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Eye, EyeOff, Lock, AlertTriangle } from 'lucide-react'
import StarField from '@/components/ui/StarField'
import { supabase } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError('E-mail ou senha inválidos.')
        return
      }

      router.push('/admin/dashboard')
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="page-wrapper">
      <StarField count={80} />

      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="w-full max-w-md animate-slide-up">
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(244,208,63,0.1)', border: '1px solid rgba(244,208,63,0.3)' }}
            >
              <Lock size={28} style={{ color: 'var(--star-gold)' }} />
            </div>
            <h1 className="heading-md" style={{ fontFamily: 'var(--font-title)', color: 'var(--star-gold)' }}>
              Painel Administrativo
            </h1>
            <p className="text-muted text-sm mt-1">Memórias da Lorena</p>
          </div>

          <div className="glass-card p-8">
            <form onSubmit={handleLogin} noValidate>
              <div className="mb-5">
                <label htmlFor="admin-email" className="label-field">E-mail</label>
                <input
                  id="admin-email"
                  type="email"
                  className="input-field"
                  placeholder="admin@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="mb-6">
                <label htmlFor="admin-password" className="label-field">Senha</label>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    className="input-field pr-12"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-silver transition-colors"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  className="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
                  role="alert"
                >
                  <AlertTriangle size={16} />
                  {error}
                </div>
              )}

              <button
                id="admin-login-submit"
                type="submit"
                className="btn btn-primary w-full"
                disabled={isLoading || !email || !password}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin w-4 h-4 border-2 rounded-full inline-block"
                      style={{ borderColor: 'rgba(26,10,64,0.3)', borderTopColor: 'transparent' }} />
                    Entrando...
                  </span>
                ) : (
                  <>
                    <Star size={18} />
                    Entrar
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-muted mt-6">
            Área restrita — apenas administradores autorizados
          </p>
        </div>
      </div>
    </main>
  )
}
