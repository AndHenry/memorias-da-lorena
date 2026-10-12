'use client'

import { useEffect, useState, useCallback } from 'react'
import { Save, Settings, ShieldCheck, UploadCloud, Eye, RefreshCw, AlertCircle } from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { ToastContainer, useToast } from '@/components/ui/Toast'
import type { Event, GalleryVisibility, EventStatus } from '@/types/database'
import { authFetch } from '@/lib/supabase/client'

const EVENT_SLUG = process.env.NEXT_PUBLIC_EVENT_SLUG || 'lorena-rayla-xv'

export default function AdminConfiguracoesPage() {
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toasts, show, remove } = useToast()

  // Form states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<EventStatus>('active')
  const [uploadEnabled, setUploadEnabled] = useState(true)
  const [uploadClosedMessage, setUploadClosedMessage] = useState('')
  const [galleryVisibility, setGalleryVisibility] = useState<GalleryVisibility>('public')
  const [moderationEnabled, setModerationEnabled] = useState(false)
  const [downloadsEnabled, setDownloadsEnabled] = useState(true)
  const [maxFileSizeMb, setMaxFileSizeMb] = useState(15)
  const [maxVideoSizeMb, setMaxVideoSizeMb] = useState(100)
  const [maxFilesPerUpload, setMaxFilesPerUpload] = useState(10)

  const fetchConfig = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await authFetch(`/api/admin/event?slug=${EVENT_SLUG}`)
      const data = await res.json()
      if (!res.ok) {
        show(data.error || 'Erro ao carregar configurações', 'error')
        return
      }

      const ev: Event = data.event
      if (ev) {
        setEvent(ev)
        setTitle(ev.title || '')
        setDescription(ev.description || '')
        setStatus(ev.status || 'active')
        setUploadEnabled(ev.upload_enabled ?? true)
        setUploadClosedMessage(ev.upload_closed_message || 'O período de envio de fotos foi encerrado. Obrigado por participar!')
        setGalleryVisibility(ev.gallery_visibility || 'public')
        setModerationEnabled(ev.moderation_enabled ?? false)
        setDownloadsEnabled(ev.downloads_enabled ?? true)
        setMaxFileSizeMb(ev.max_file_size_mb || 15)
        setMaxVideoSizeMb(ev.max_video_size_mb || 100)
        setMaxFilesPerUpload(ev.max_files_per_upload || 10)
      }
    } catch (err) {
      console.error('Erro ao conectar:', err)
      show('Erro ao conectar com o servidor', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [show])

  useEffect(() => {
    fetchConfig()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const payload = {
        slug: EVENT_SLUG,
        title,
        description,
        status,
        upload_enabled: uploadEnabled,
        upload_closed_message: uploadClosedMessage,
        gallery_visibility: galleryVisibility,
        moderation_enabled: moderationEnabled,
        downloads_enabled: downloadsEnabled,
        max_file_size_mb: Number(maxFileSizeMb),
        max_video_size_mb: Number(maxVideoSizeMb),
        max_files_per_upload: Number(maxFilesPerUpload),
      }

      const res = await authFetch('/api/admin/event', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        show(data.error || 'Erro ao salvar alterações', 'error')
        return
      }

      setEvent(data.event)
      show('Configurações atualizadas com sucesso!', 'success')
    } catch {
      show('Erro ao conectar com o servidor para salvar', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <LoadingSpinner size={40} text="Carregando configurações do evento..." />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto pb-16">
      <ToastContainer toasts={toasts} remove={remove} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="heading-lg mb-1 flex items-center gap-3" style={{ fontFamily: 'var(--font-title)', color: 'var(--star-gold)' }}>
            <Settings size={28} />
            Configurações do Evento
          </h1>
          <p className="text-muted text-sm">
            Gerencie o funcionamento em tempo real de uploads, moderação e visualização do álbum.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchConfig}
          className="btn btn-secondary btn-sm flex items-center gap-2 self-start sm:self-auto"
          title="Recarregar dados atuais"
        >
          <RefreshCw size={15} />
          Recarregar
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Seção 1: Informações Gerais */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b" style={{ borderColor: 'var(--glass-border)' }}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--star-gold)' }} />
            <h2 className="text-base font-semibold text-white">Informações Principais</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted mb-1">
                Nome do Evento / Álbum
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg text-sm bg-black/40 border border-white/10 text-white focus:outline-none focus:border-amber-400/50 transition-colors"
                placeholder="Ex: Memórias da Lorena — Uma Noite Estrelada"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-muted mb-1">
                Descrição ou Mensagem de Boas-Vindas
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg text-sm bg-black/40 border border-white/10 text-white focus:outline-none focus:border-amber-400/50 transition-colors"
                placeholder="Mensagem exibida na página inicial do evento..."
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-muted mb-1">
                Status Geral do Evento
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EventStatus)}
                className="w-full px-4 py-2.5 rounded-lg text-sm bg-black/40 border border-white/10 text-white focus:outline-none focus:border-amber-400/50 transition-colors"
              >
                <option value="active">🟢 Ativo (Em andamento / Disponível)</option>
                <option value="closed">🟡 Encerrado (Apenas visualização)</option>
                <option value="archived">🔴 Arquivado (Acesso restrito)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Seção 2: Controle de Uploads */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b" style={{ borderColor: 'var(--glass-border)' }}>
            <UploadCloud size={18} style={{ color: 'var(--star-gold)' }} />
            <h2 className="text-base font-semibold text-white">Controle de Envios (Uploads)</h2>
          </div>

          <div className="space-y-5">
            {/* Toggle Upload Enabled */}
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-black/30 border border-white/5">
              <div>
                <p className="text-sm font-medium text-white">Permitir Envio de Novas Mídias</p>
                <p className="text-xs text-muted">
                  Desative a qualquer momento para pausar ou finalizar o recebimento de fotos da festa.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={uploadEnabled}
                  onChange={(e) => setUploadEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400"></div>
              </label>
            </div>

            {!uploadEnabled && (
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted mb-1">
                  Mensagem exibida aos convidados quando o upload estiver desativado
                </label>
                <input
                  type="text"
                  value={uploadClosedMessage}
                  onChange={(e) => setUploadClosedMessage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg text-sm bg-black/40 border border-white/10 text-white focus:outline-none focus:border-amber-400/50"
                  placeholder="Ex: O período de envio de fotos foi encerrado."
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted mb-1">
                  Tamanho Máx. Foto (MB)
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={maxFileSizeMb}
                  onChange={(e) => setMaxFileSizeMb(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg text-sm bg-black/40 border border-white/10 text-white"
                />
                <p className="text-[11px] text-muted mt-1">Recomendado: 15 MB</p>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-muted mb-1">
                  Tamanho Máx. Vídeo (MB)
                </label>
                <input
                  type="number"
                  min={5}
                  max={200}
                  value={maxVideoSizeMb}
                  onChange={(e) => setMaxVideoSizeMb(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg text-sm bg-black/40 border border-white/10 text-white"
                />
                <p className="text-[11px] text-muted mt-1">Recomendado: 50 a 100 MB</p>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-muted mb-1">
                  Arquivos por Lote
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={maxFilesPerUpload}
                  onChange={(e) => setMaxFilesPerUpload(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg text-sm bg-black/40 border border-white/10 text-white"
                />
                <p className="text-[11px] text-muted mt-1">Máx por envio: 10</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seção 3: Moderação e Galeria */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b" style={{ borderColor: 'var(--glass-border)' }}>
            <ShieldCheck size={18} style={{ color: 'var(--star-gold)' }} />
            <h2 className="text-base font-semibold text-white">Galeria, Moderação e Downloads</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted mb-1">
                Visibilidade da Galeria Compartilhada
              </label>
              <select
                value={galleryVisibility}
                onChange={(e) => setGalleryVisibility(e.target.value as GalleryVisibility)}
                className="w-full px-4 py-2.5 rounded-lg text-sm bg-black/40 border border-white/10 text-white focus:outline-none focus:border-amber-400/50"
              >
                <option value="public">Pública (Todos os convidados podem ver)</option>
                <option value="private">Privada (Apenas administradores)</option>
                <option value="closed">Fechada temporariamente</option>
              </select>
            </div>

            {/* Toggle Moderation */}
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-black/30 border border-white/5">
              <div>
                <p className="text-sm font-medium text-white">Moderação Prévia Obrigatória</p>
                <p className="text-xs text-muted">
                  Se ativado, novas fotos e vídeos só aparecem na galeria após você aprovar no painel.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={moderationEnabled}
                  onChange={(e) => setModerationEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400"></div>
              </label>
            </div>

            {/* Toggle Downloads */}
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-black/30 border border-white/5">
              <div>
                <p className="text-sm font-medium text-white">Permitir Downloads pelos Convidados</p>
                <p className="text-xs text-muted">
                  Permite que os convidados baixem fotos e vídeos da galeria diretamente em alta resolução.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={downloadsEnabled}
                  onChange={(e) => setDownloadsEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Botão de Salvar */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="btn btn-primary px-8 py-3 font-semibold flex items-center gap-2 shadow-lg shadow-amber-400/20"
          >
            {isSaving ? (
              <>
                <LoadingSpinner size={18} />
                Salvando...
              </>
            ) : (
              <>
                <Save size={18} />
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
