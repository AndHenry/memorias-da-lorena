'use client'

import { useEffect, useState, useCallback } from 'react'
import { CheckCircle, XCircle, Trash2, Camera, Film, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
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
      setMedia((prev) => prev.filter((m) => m.id !== mediaId))
    } catch {
      show('Erro de conexão', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const filters: { label: string; value: FilterStatus }[] = [
    { label: 'Pendentes', value: 'pending' },
    { label: 'Aprovados', value: 'approved' },
    { label: 'Rejeitados', value: 'rejected' },
    { label: 'Todos', value: 'all' },
  ]

  return (
    <div>
      <ToastContainer toasts={toasts} remove={remove} />

      <div className="mb-6">
        <h1 className="heading-lg mb-1" style={{ fontFamily: 'var(--font-title)', color: 'var(--star-gold)' }}>
          Gerenciar Galeria
        </h1>
        <p className="text-muted text-sm">Aprovar, rejeitar ou excluir arquivos enviados pelos convidados</p>
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
                    <th>Arquivo</th>
                    <th>Enviado por</th>
                    <th>Tipo</th>
                    <th>Tamanho</th>
                    <th>Data</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {media.map((item) => (
                    <tr key={item.id}>
                      {/* Preview */}
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
                            style={{ background: 'rgba(255,255,255,0.05)' }}>
                            {item.media_type === 'video' ? (
                              <Film size={20} style={{ color: 'var(--cosmic-light)' }} />
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={`/api/media/${item.id}/thumbnail`}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none'
                                }}
                              />
                            )}
                          </div>
                          <span className="text-xs truncate max-w-[120px]" style={{ color: 'var(--star-silver)' }}>
                            {item.original_filename || '—'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="font-medium text-sm" style={{ color: 'var(--star-gold)' }}>
                          {item.uploader_name}
                        </span>
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
                        <div className="flex items-center gap-2">
                          {item.moderation_status !== 'approved' && (
                            <button
                              onClick={() => handleAction(item.id, 'approve')}
                              disabled={actionLoading === item.id}
                              className="p-2 rounded-lg transition-colors hover:bg-green-500/20"
                              aria-label="Aprovar"
                              title="Aprovar"
                            >
                              <CheckCircle size={18} style={{ color: '#22c55e' }} />
                            </button>
                          )}
                          {item.moderation_status !== 'rejected' && (
                            <button
                              onClick={() => handleAction(item.id, 'reject')}
                              disabled={actionLoading === item.id}
                              className="p-2 rounded-lg transition-colors hover:bg-yellow-500/20"
                              aria-label="Rejeitar"
                              title="Rejeitar"
                            >
                              <XCircle size={18} style={{ color: '#fbbf24' }} />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (confirm('Excluir permanentemente este arquivo?')) handleAction(item.id, 'delete')
                            }}
                            disabled={actionLoading === item.id}
                            className="p-2 rounded-lg transition-colors hover:bg-red-500/20"
                            aria-label="Excluir"
                            title="Excluir permanentemente"
                          >
                            <Trash2 size={18} style={{ color: '#f87171' }} />
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
