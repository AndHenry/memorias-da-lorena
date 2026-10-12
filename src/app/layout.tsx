import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Memórias da Lorena — Uma Noite Estrelada',
  description: 'Álbum digital da festa de 15 anos de Lorena Rayla. Compartilhe suas fotos e lembranças dessa noite especial.',
  keywords: ['festa 15 anos', 'Lorena Rayla', 'álbum digital', 'memórias', 'noite estrelada'],
  authors: [{ name: 'Família Rayla' }],
  robots: 'noindex, nofollow',
  openGraph: {
    title: 'Memórias da Lorena — Uma Noite Estrelada',
    description: 'Compartilhe suas fotos e ajude a eternizar essa noite especial.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#030712',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        <div className="starfield-bg" aria-hidden="true" />
        {children}
      </body>
    </html>
  )
}
