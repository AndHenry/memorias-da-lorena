'use client'

import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: number
  text?: string
  className?: string
}

export default function LoadingSpinner({ size = 24, text, className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 size={size} className="animate-spin text-gold" style={{ color: 'var(--star-gold)' }} />
      {text && <p className="text-muted text-sm animate-pulse">{text}</p>}
    </div>
  )
}
