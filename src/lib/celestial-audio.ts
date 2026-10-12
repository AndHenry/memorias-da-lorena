/**
 * Sintetizador celestial usando Web Audio API.
 * Cria uma melodia suave de caixinha de música / harpa estelar
 * sem precisar de arquivos externos de áudio pesados.
 */

class CelestialAudioPlayer {
  private ctx: AudioContext | null = null
  private gainNode: GainNode | null = null
  private isPlaying = false
  private timer: NodeJS.Timeout | null = null
  private step = 0

  // Escala mágica / caixinha de música (frequências em Hz)
  // Progressão emocional: Cmaj9 -> Am9 -> Fmaj7 -> Gsus4
  private melodies: number[][] = [
    // Compassos com notas cintilantes
    [523.25, 659.25, 783.99, 987.77, 1046.5],   // C5, E5, G5, B5, C6
    [440.0, 523.25, 659.25, 880.0, 1046.5],     // A4, C5, E5, A5, C6
    [349.23, 440.0, 523.25, 698.46, 880.0],     // F4, A4, C5, F5, A5
    [392.0, 493.88, 587.33, 783.99, 987.77],    // G4, B4, D5, G5, B5
  ]

  public start(volume = 0.3) {
    if (typeof window === 'undefined') return
    if (this.isPlaying) return

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new AudioCtx()
      if (this.ctx.state === 'suspended') {
        this.ctx.resume()
      }

      this.gainNode = this.ctx.createGain()
      this.gainNode.gain.setValueAtTime(volume, this.ctx.currentTime)
      this.gainNode.connect(this.ctx.destination)
      this.isPlaying = true
      this.step = 0

      this.scheduleNext()
    } catch (e) {
      console.warn('AudioContext não suportado ou bloqueado:', e)
    }
  }

  private playBellNote(freq: number, duration = 1.8) {
    if (!this.ctx || !this.gainNode || !this.isPlaying) return

    const now = this.ctx.currentTime

    // Oscilador principal (sine = tom puro suave)
    const osc1 = this.ctx.createOscillator()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(freq, now)

    // Oscilador harmônico (triangle para brilho de sino)
    const osc2 = this.ctx.createOscillator()
    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(freq * 2, now)

    // Ganho com envelope de sino (attack rápido, decay longo)
    const noteGain = this.ctx.createGain()
    noteGain.gain.setValueAtTime(0.001, now)
    noteGain.gain.exponentialRampToValueAtTime(0.18, now + 0.04)
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

    osc1.connect(noteGain)
    osc2.connect(noteGain)
    noteGain.connect(this.gainNode)

    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + duration)
    osc2.stop(now + duration)
  }

  private scheduleNext() {
    if (!this.isPlaying) return

    const patternIndex = Math.floor(this.step / 8) % this.melodies.length
    const pattern = this.melodies[patternIndex]
    const noteIndex = this.step % pattern.length
    const freq = pattern[noteIndex]

    // Toca a nota atual
    this.playBellNote(freq, 2.2)

    // Variação rítmica sutil (arpejo estrelado)
    const interval = (this.step % 2 === 0) ? 600 : 800
    this.step = (this.step + 1) % 64

    this.timer = setTimeout(() => {
      this.scheduleNext()
    }, interval)
  }

  public stop() {
    this.isPlaying = false
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    if (this.ctx) {
      try {
        this.ctx.close()
      } catch {}
      this.ctx = null
    }
  }

  public setVolume(volume: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime)
    }
  }

  public get active(): boolean {
    return this.isPlaying
  }
}

export const celestialAudio = new CelestialAudioPlayer()
