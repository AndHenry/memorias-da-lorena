import type { Metadata } from 'next'
import HomeClient from './HomeClient'

export const metadata: Metadata = {
  title: 'Memórias da Lorena — Uma Noite Estrelada',
  description: 'Álbum digital da festa de 15 anos de Lorena Rayla. 17 de outubro de 2026.',
}

export default function HomePage() {
  return <HomeClient />
}
