'use client'

import { useState, useEffect } from 'react'
import { QrCode, Download, Copy, Check, Printer, Sparkles, ExternalLink } from 'lucide-react'
import QRCode from 'qrcode'
import { ToastContainer, useToast } from '@/components/ui/Toast'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const EVENT_SLUG = process.env.NEXT_PUBLIC_EVENT_SLUG || 'lorena-rayla-xv'

export default function AdminQRCodePage() {
  const [siteUrl, setSiteUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [qrSize, setQrSize] = useState('600')
  const [qrPngUrl, setQrPngUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const { toasts, show, remove } = useToast()

  useEffect(() => {
    // Determine the base origin
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    setSiteUrl(origin)
  }, [])

  const targetUrl = siteUrl ? `${siteUrl}/e/${EVENT_SLUG}` : ''

  useEffect(() => {
    if (!targetUrl) return
    setIsLoading(true)
    QRCode.toDataURL(targetUrl, {
      width: parseInt(qrSize, 10),
      margin: 2,
      color: {
        dark: '#1a0a3e',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((dataUrl) => {
        setQrPngUrl(dataUrl)
      })
      .catch((err) => {
        console.error('Erro ao gerar QR Code:', err)
        show('Erro ao gerar imagem do QR Code.', 'error')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [targetUrl, qrSize, show])

  const handleCopy = () => {
    if (!targetUrl) return
    navigator.clipboard.writeText(targetUrl)
    setCopied(true)
    show('Link copiado para a área de transferência!', 'success')
    setTimeout(() => setCopied(false), 2500)
  }

  const handleDownload = async (format: 'png' | 'svg') => {
    if (!targetUrl) return
    try {
      if (format === 'png') {
        if (!qrPngUrl) return
        const a = document.createElement('a')
        a.href = qrPngUrl
        a.download = `qrcode-lorena-rayla-${qrSize}px.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        show(`Download do QR Code (PNG ${qrSize}px) concluído!`, 'success')
      } else {
        const svgString = await QRCode.toString(targetUrl, {
          type: 'svg',
          margin: 2,
          color: {
            dark: '#1a0a3e',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'H',
        })
        const blob = new Blob([svgString], { type: 'image/svg+xml' })
        const blobUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = 'qrcode-lorena-rayla-vetorial.svg'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(blobUrl)
        show('Download do QR Code (SVG) concluído!', 'success')
      }
    } catch {
      show('Falha ao gerar arquivo para download.', 'error')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="max-w-4xl mx-auto pb-16">
      <ToastContainer toasts={toasts} remove={remove} />

      {/* Screen-only content */}
      <div className="print:hidden">
        {/* Header */}
        <div className="mb-8">
          <h1 className="heading-lg mb-1 flex items-center gap-3" style={{ fontFamily: 'var(--font-title)', color: 'var(--star-gold)' }}>
            <QrCode size={28} />
            QR Code do Evento
          </h1>
          <p className="text-muted text-sm">
            Gere, personalize e imprima o QR Code para colocar nas mesas dos convidados, totens e telões da festa.
          </p>
        </div>

        {/* URL Card */}
        <div className="glass-card p-5 mb-8">
          <label className="block text-xs uppercase tracking-wider text-muted mb-2">
            Link direto de acesso ao álbum
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full flex-1 px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-amber-200 text-sm font-mono truncate select-all">
              {targetUrl || 'Carregando link...'}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleCopy}
                className="btn btn-secondary btn-sm flex-1 sm:flex-initial flex items-center justify-center gap-2"
              >
                {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
              <a
                href={targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm flex items-center justify-center gap-2"
                title="Abrir página no navegador"
              >
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* Action Controls & Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-8">
          {/* Controls */}
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles size={18} style={{ color: 'var(--star-gold)' }} />
                Opções de Download
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted mb-1.5">
                    Resolução para Imagem PNG
                  </label>
                  <select
                    value={qrSize}
                    onChange={(e) => setQrSize(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg text-sm bg-black/40 border border-white/10 text-white"
                  >
                    <option value="400">400 × 400 px (Uso digital / Redes)</option>
                    <option value="600">600 × 600 px (Impressão de plaquinhas 10x15)</option>
                    <option value="1200">1200 × 1200 px (Alta resolução para totens e banners)</option>
                  </select>
                </div>

                <div className="pt-2 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => handleDownload('png')}
                    className="btn btn-primary w-full py-3 flex items-center justify-center gap-2 font-medium"
                  >
                    <Download size={18} />
                    Baixar Imagem PNG ({qrSize}px)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownload('svg')}
                    className="btn btn-secondary w-full py-3 flex items-center justify-center gap-2 font-medium"
                  >
                    <Download size={18} />
                    Baixar Vetor SVG (Gráfica profissional)
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="btn btn-secondary w-full py-3 flex items-center justify-center gap-2 font-medium border-amber-400/30 text-amber-300 hover:border-amber-400"
                  >
                    <Printer size={18} />
                    Imprimir Plaquinha de Mesa (A4)
                  </button>
                </div>
              </div>
            </div>

            {/* Dicas para o dia do evento */}
            <div className="glass-card p-5 text-sm space-y-2 border-l-4" style={{ borderLeftColor: 'var(--star-gold)' }}>
              <p className="font-semibold text-white">💡 Dicas para a festa:</p>
              <ul className="text-muted text-xs space-y-1.5 list-disc list-inside">
                <li>Coloque um display com QR Code em cada mesa de convidados.</li>
                <li>Inclua o QR Code no telão do salão durante os intervalos da valsa e fotos.</li>
                <li>Certifique-se de que o Wi-Fi do local tenha boa cobertura para os convidados.</li>
              </ul>
            </div>
          </div>

          {/* Live Preview */}
          <div className="glass-card p-8 flex flex-col items-center text-center">
            <span className="text-xs uppercase tracking-wider text-muted mb-4 font-mono">
              Pré-visualização do Display
            </span>

            <div
              className="w-full max-w-xs p-6 rounded-2xl flex flex-col items-center"
              style={{
                background: 'linear-gradient(135deg, rgba(20, 10, 45, 0.95), rgba(6, 10, 24, 0.95))',
                border: '1.5px solid rgba(244, 208, 63, 0.35)',
                boxShadow: '0 0 35px rgba(244, 208, 63, 0.1)',
              }}
            >
              <p
                className="text-lg font-bold mb-1"
                style={{ fontFamily: 'var(--font-title)', color: 'var(--star-gold)' }}
              >
                Lorena Rayla XV
              </p>
              <p className="text-xs text-slate-300 mb-5 tracking-wide">
                Uma Noite Estrelada
              </p>

              {/* QR Image */}
              <div className="w-52 h-52 bg-white p-3 rounded-xl shadow-lg flex items-center justify-center">
                {isLoading || !qrPngUrl ? (
                  <LoadingSpinner size={32} />
                ) : (
                  <img
                    src={qrPngUrl}
                    alt="QR Code do Álbum da Lorena"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              <p className="text-xs text-amber-200 mt-4 font-medium text-center leading-relaxed">
                Aponte a câmera do celular para compartilhar suas fotos e vídeos!
              </p>
              <p className="text-[10px] text-slate-400 mt-2 font-mono">
                {EVENT_SLUG}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Display Template (Only visible when printing window.print()) */}
      <div className="hidden print:flex print:flex-col print:items-center print:justify-center print:min-h-screen print:p-8 print:text-black">
        <style jsx global>{`
          @media print {
            body {
              background: white !important;
              color: black !important;
            }
            .admin-sidebar, header {
              display: none !important;
            }
          }
        `}</style>

        <div className="border-4 border-amber-600 p-10 rounded-3xl max-w-md w-full text-center flex flex-col items-center">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-1">
            Memórias da Lorena
          </h1>
          <p className="text-lg font-serif italic text-amber-700 mb-6">
            Uma Noite Estrelada — 15 Anos
          </p>

          <div className="border-2 border-gray-300 p-4 rounded-2xl bg-white shadow-sm mb-6">
            {qrPngUrl && (
              <img
                src={qrPngUrl}
                alt="QR Code"
                className="w-64 h-64 object-contain mx-auto"
              />
            )}
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Compartilhe seus momentos!
          </h2>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed max-w-xs">
            Aponte a câmera do seu celular para o QR Code acima e envie todas as fotos e vídeos que tirar durante a festa para o nosso álbum colaborativo.
          </p>

          <div className="pt-4 border-t border-gray-200 w-full text-center">
            <p className="text-xs font-mono text-gray-500">
              {targetUrl}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
