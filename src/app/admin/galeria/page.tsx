'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  CheckCircle,
  XCircle,
  Trash2,
  Film,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Clock,
  MessageSquareQuote,
  Maximize2,
  Play,
} from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { ToastContainer, useToast } from '@/components/ui/Toast'
import type { Media } from '@/types/database'
import { formatBytes } from '@/lib/validations'
import { authFetch } from '@/lib/supabase/client'

const EVENT_SLUG = process.env.NEXT_PUBLIC_EVENT_SLUG || 'lorena-rayla-xv'

type FilterStatus = 'pending' | 'approved' | 'rejected' | 'all'

export default function AdminGaleriaPage() {
  const [media, setMedia] = useState<Media[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<FilterStatus>('pending')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [previewMediaIndex, setPreviewMediaIndex] = useState<number | null>(null)
  const { toasts, show, remove } = useToast()

  const fetchMedia = useCallback(async (pageNum: number, status: FilterStatus) => {
    setIsLoading(true)
    try {
      const res = await authFetch(`/api/admin/moderate?slug=${EVENT_SLUG}&status=${status}&page=${pageNum}`)
      const data = await res.json()
      if (!res.ok) { show(data.error || 'Erro ao buscar arquivos', 'error'); return }
      setMedia(data.media || [])
      setHasMore((data.media || []).length === 30)
    } catch {
      show('Erro de conexão', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [show])

  useEffect(() => {
    setPage(0)
    setPreviewMediaIndex(null)
    fetchMedia(0, filter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const handleAction = async (mediaId: string, action: 'approve' | 'reject' | 'delete') => {
    setActionLoading(mediaId)
    try {
      const res = await authFetch('/api/admin/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId, action }),
      })
      const data = await res.json()
      if (!res.ok) { show(data.error || 'Erro', 'error'); return }

      const labels = { approve: 'aprovado', reject: 'rejeitado', delete: 'excluído' }
      show(`Arquivo ${labels[action]} com sucesso.`, 'success')

      if (filter !== 'all') {
        setMedia((prev) => prev.filter((m) => m.id !== mediaId))
      } else {
        const nextStatus = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : null
        if (nextStatus) {
          setMedia((prev) => prev.map((m) => m.id === mediaId ? { ...m, moderation_status: nextStatus } : m))
        } else {
          setMedia((prev) => prev.filter((m) => m.id !== mediaId))
        }
      }

      // Se estiver no modal, avança para a próxima se tiver
      if (previewMediaIndex !== null) {
        if (previewMediaIndex >= media.length - 1) {
          setPreviewMediaIndex(null)
        }
      }
    } catch {
      show('Erro de conexão', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const selectedMedia = previewMediaIndex !== null ? media[previewMediaIndex] : null

  const filters: { label: string; value: FilterStatus }[] = [
    { label: 'Pendentes', value: 'pending' },
    { label: 'Aprovados', value: 'approved' },
    { label: 'Rejeitados', value: 'rejected' },
    { label: 'Todos', value: 'all' },
  ]

  return (
    <div>
      <ToastContainer toasts={toasts} remove={remove} />

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="heading-lg mb-1" style={{ fontFamily: 'var(--font-title)', color: 'var(--star-gold)' }}>
            Gerenciar Galeria
          </h1>
          <p className="text-muted text-sm">Visualize, aprove, rejeite ou exclua arquivos enviados pelos convidados</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`btn btn-sm ${filter === f.value ? 'btn-primary' : 'btn-secondary'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* MODAL DE PRÉ-VISUALIZAÇÃO COMPLETA */}
      {selectedMedia && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setPreviewMediaIndex(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="glass-card max-w-4xl w-full max-h-[92vh] flex flex-col rounded-2xl overflow-hidden border border-amber-400/25 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ background: 'rgba(6, 10, 24, 0.96)' }}
          >
            {/* Header do Modal */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-3">
                <span className={`badge badge-${selectedMedia.moderation_status}`}>
                  {selectedMedia.moderation_status === 'pending' ? 'Pendente' :
                   selectedMedia.moderation_status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                </span>
                <span className="font-semibold text-sm" style={{ color: 'var(--star-gold)' }}>
                  Enviado por: {selectedMedia.uploader_name}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewMediaIndex(null)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-muted hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Conteúdo Central: Mídia em alta resolução */}
            <div className="flex-1 overflow-auto p-4 flex flex-col items-center justify-center bg-black/60 min-h-[350px]">
              {selectedMedia.media_type === 'video' ? (
                <video
                  src={selectedMedia.fullUrl || `/api/media/${selectedMedia.id}/signed-url`}
                  controls
                  autoPlay
                  className="max-h-[55vh] max-w-full rounded-xl shadow-lg"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedMedia.fullUrl || selectedMedia.previewUrl || `/api/media/${selectedMedia.id}/signed-url`}
                  alt={`Enviado por ${selectedMedia.uploader_name}`}
                  className="max-h-[55vh] max-w-full rounded-xl object-contain shadow-lg"
                />
              )}

              {/* Legenda (se houver) */}
              {selectedMedia.caption && (
                <div className="mt-4 px-4 py-2.5 rounded-xl border border-amber-400/25 bg-amber-400/10 max-w-lg text-center">
                  <p className="text-xs uppercase tracking-wider text-amber-300 font-semibold mb-0.5 flex items-center justify-center gap-1">
                    <MessageSquareQuote size={13} /> Legenda do convidado
                  </p>
                  <p className="text-sm italic text-amber-100">&ldquo;{selectedMedia.caption}&rdquo;</p>
                </div>
              )}
            </div>

            {/* Detalhes & Barra de Ações */}
            <div className="p-4 border-t border-white/10 bg-black/40 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-muted space-y-0.5">
                <p>
                  <strong className="text-slate-300">Data de envio:</strong>{' '}
                  {new Date(selectedMedia.created_at).toLocaleString('pt-BR')}
                </p>
                <p>
                  <strong className="text-slate-300">Tamanho:</strong>{' '}
                  {selectedMedia.file_size ? formatBytes(selectedMedia.file_size) : '—'}
                </p>
              </div>

              {/* Botões de Decisão */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAction(selectedMedia.id, 'approve')}
                  disabled={actionLoading === selectedMedia.id}
                  className="btn btn-sm flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-2 rounded-xl shadow-md shadow-green-600/30 transition-all"
                >
                  <CheckCircle size={16} />
                  <span>Aprovar Foto</span>
                </button>

                <button
                  onClick={() => handleAction(selectedMedia.id, 'reject')}
                  disabled={actionLoading === selectedMedia.id}
                  className="btn btn-sm flex items-center gap-1.5 bg-yellow-600/80 hover:bg-yellow-600 text-white font-bold px-4 py-2 rounded-xl transition-all"
                >
                  <XCircle size={16} />
                  <span>Rejeitar</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm('Excluir permanentemente este arquivo?')) {
                      handleAction(selectedMedia.id, 'delete')
                    }
                  }}
                  disabled={actionLoading === selectedMedia.id}
                  className="btn btn-sm flex items-center gap-1.5 bg-red-600/20 hover:bg-red-600 text-red-200 hover:text-white px-3 py-2 rounded-xl border border-red-500/30 transition-all"
                >
                  <Trash2 size={16} />
                  <span>Excluir</span>
                </button>
              </div>
            </div>

            {/* Navegação entre itens */}
            <div className="px-4 py-2 border-t border-white/5 bg-black/80 flex items-center justify-between text-xs text-muted">
              <button
                onClick={() => setPreviewMediaIndex((i) => (i !== null && i > 0 ? i - 1 : i))}
                disabled={previewMediaIndex === 0}
                className="flex items-center gap-1 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft size={14} /> Item anterior
              </button>
              <span>{(previewMediaIndex ?? 0) + 1} de {media.length}</span>
              <button
                onClick={() => setPreviewMediaIndex((i) => (i !== null && i < media.length - 1 ? i + 1 : i))}
                disabled={previewMediaIndex === media.length - 1}
                className="flex items-center gap-1 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
              >
                Próximo item <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner size={36} text="Carregando arquivos..." className="py-16" />
      ) : media.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-muted">Nenhum arquivo {filter !== 'all' ? `com status "${filter}"` : ''} encontrado.</p>
        </div>
      ) : (
        <>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Visualizar</th>
                    <th>Enviado por</th>
                    <th>Legenda</th>
                    <th>Tipo</th>
                    <th>Tamanho</th>
                    <th>Data</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {media.map((item, index) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Preview Thumbnail */}
                      <td>
                        <button
                          type="button"
                          onClick={() => setPreviewMediaIndex(index)}
                          className="flex items-center gap-3 group text-left"
                          title="Clique para inspecionar em tamanho grande"
                        >
                          <div
                            className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center relative border border-white/10 group-hover:border-amber-400/50 transition-colors"
                            style={{ background: 'rgba(255,255,255,0.05)' }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.previewUrl || `/api/media/${item.id}/thumbnail`}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.opacity = '0'
                              }}
                            />
                            {item.media_type === 'video' && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                <Play size={16} fill="var(--star-gold)" style={{ color: 'var(--star-gold)' }} />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Maximize2 size={16} className="text-amber-300" />
                            </div>
                          </div>
                          <div>
                            <span className="text-xs truncate max-w-[120px] block font-medium group-hover:text-amber-300 transition-colors" style={{ color: 'var(--star-silver)' }}>
                              {item.original_filename || 'Ver arquivo'}
                            </span>
                            <span className="text-[10px] text-amber-400/80 flex items-center gap-1 mt-0.5">
                              <Eye size={10} /> Clique p/ ver
                            </span>
                          </div>
                        </button>
                      </td>

                      {/* Nome do convidado */}
                      <td>
                        <span className="font-semibold text-sm" style={{ color: 'var(--star-gold)' }}>
                          {item.uploader_name}
                        </span>
                      </td>

                      {/* Legenda (se houver) */}
                      <td>
                        {item.caption ? (
                          <span
                            className="text-xs italic text-star-silver max-w-[160px] truncate block opacity-90"
                            title={item.caption}
                          >
                            &ldquo;{item.caption}&rdquo;
                          </span>
                        ) : (
                          <span className="text-xs text-muted opacity-40">—</span>
                        )}
                      </td>

                      <td>
                        <span className={`badge ${item.media_type === 'video' ? 'badge-video' : 'badge-photo'}`}>
                          {item.media_type === 'video' ? 'Vídeo' : 'Foto'}
                        </span>
                      </td>

                      <td className="text-muted text-sm">{item.file_size ? formatBytes(item.file_size) : '—'}</td>

                      <td className="text-muted text-sm">
                        {new Date(item.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>

                      <td>
                        <span className={`badge badge-${item.moderation_status}`}>
                          {item.moderation_status === 'pending' ? 'Pendente' :
                           item.moderation_status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                        </span>
                      </td>

                      <td>
                        <div className="flex items-center gap-1.5">
                          {/* Botão de Ver Grande */}
                          <button
                            onClick={() => setPreviewMediaIndex(index)}
                            className="p-2 rounded-lg transition-colors hover:bg-white/10 text-slate-300 hover:text-white"
                            aria-label="Visualizar"
                            title="Visualizar em tela cheia"
                          >
                            <Eye size={17} />
                          </button>

                          {item.moderation_status !== 'approved' && (
                            <button
                              onClick={() => handleAction(item.id, 'approve')}
                              disabled={actionLoading === item.id}
                              className="p-2 rounded-lg transition-colors hover:bg-green-500/20 text-green-400 hover:text-green-300"
                              aria-label="Aprovar"
                              title="Aprovar"
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}

                          {item.moderation_status !== 'rejected' && (
                            <button
                              onClick={() => handleAction(item.id, 'reject')}
                              disabled={actionLoading === item.id}
                              className="p-2 rounded-lg transition-colors hover:bg-yellow-500/20 text-yellow-400 hover:text-yellow-300"
                              aria-label="Rejeitar"
                              title="Rejeitar"
                            >
                              <XCircle size={18} />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (confirm('Excluir permanentemente este arquivo?')) handleAction(item.id, 'delete')
                            }}
                            disabled={actionLoading === item.id}
                            className="p-2 rounded-lg transition-colors hover:bg-red-500/20 text-red-400 hover:text-red-300"
                            aria-label="Excluir"
                            title="Excluir permanentemente"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => { const p = Math.max(0, page - 1); setPage(p); fetchMedia(p, filter) }}
              disabled={page === 0}
              className="btn btn-secondary btn-sm"
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            <span className="text-muted text-sm">Página {page + 1}</span>
            <button
              onClick={() => { const p = page + 1; setPage(p); fetchMedia(p, filter) }}
              disabled={!hasMore}
              className="btn btn-secondary btn-sm"
            >
              Próxima <ChevronRight size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
