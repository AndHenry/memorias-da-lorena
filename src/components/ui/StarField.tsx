'use client'

import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  size: number
  opacity: number
  speed: number
  phase: number
}

export default function StarField({ count = 120 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resize()
    window.addEventListener('resize', resize)

    const stars: Star[] = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 2 + 0.3,
      opacity: Math.random() * 0.7 + 0.1,
      speed: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2,
    }))

    // Shooting stars
    let shootingTimer = 0

    const draw = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      stars.forEach((star) => {
        const twinkle = Math.sin(time * star.speed + star.phase) * 0.4 + 0.6
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(244, 208, 63, ${star.opacity * twinkle})`
        ctx.fill()
      })

      // Occasional silver stars
      stars.slice(0, Math.floor(count * 0.3)).forEach((star, i) => {
        if (i % 3 === 0) {
          const twinkle = Math.sin(time * star.speed * 1.5 + star.phase) * 0.3 + 0.7
          ctx.beginPath()
          ctx.arc(star.x * 1.1 % canvas.width, star.y * 0.9, star.size * 0.6, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(221, 230, 247, ${star.opacity * twinkle * 0.6})`
          ctx.fill()
        }
      })

      // Shooting star every ~8s
      shootingTimer += 16
      if (shootingTimer > 8000) {
        shootingTimer = 0
        const sx = Math.random() * canvas.width * 0.5
        const sy = Math.random() * canvas.height * 0.3
        const grad = ctx.createLinearGradient(sx, sy, sx + 120, sy + 60)
        grad.addColorStop(0, 'rgba(244,208,63,0)')
        grad.addColorStop(0.5, 'rgba(244,208,63,0.8)')
        grad.addColorStop(1, 'rgba(244,208,63,0)')
        ctx.beginPath()
        ctx.moveTo(sx, sy)
        ctx.lineTo(sx + 120, sy + 60)
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [count])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 0.6 }}
      aria-hidden="true"
    />
  )
}
