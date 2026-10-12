import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { generateQRCodePNG, generateQRCodeSVG } from '@/lib/qrcode'

// GET /api/qrcode?format=png|svg&url=...
export async function GET(request: NextRequest) {

  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'png'
  const url = searchParams.get('url') || (process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/` : 'https://memorias-da-lorena.netlify.app/')
  const size = Math.min(1200, Math.max(200, parseInt(searchParams.get('size') || '600')))

  if (format === 'svg') {
    const svg = await generateQRCodeSVG({ url, darkColor: '#1a0a3e', lightColor: '#ffffff' })
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': 'attachment; filename="qrcode-memorias-lorena.svg"',
        'Cache-Control': 'no-store',
      },
    })
  }

  // PNG
  const dataUrl = await generateQRCodePNG({ url, size, darkColor: '#1a0a3e', lightColor: '#ffffff' })
  const base64 = dataUrl.replace(/^data:image\/png;base64,/, '')
  const buffer = Buffer.from(base64, 'base64')

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="qrcode-memorias-lorena-${size}px.png"`,
      'Cache-Control': 'no-store',
    },
  })
}
