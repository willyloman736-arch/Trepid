/* ============================================================
   Trepid — Sound Design System
   Web Audio API synthesizer. Zero audio files, zero loading.
   All tones generated on the fly from oscillators + gain envelopes.
   ============================================================ */

const STORAGE_KEY = 'trepid_sounds'

type OscType = 'sine' | 'square' | 'sawtooth' | 'triangle'

interface SoundEventMap {
  'sounds:change': CustomEvent<{ enabled: boolean }>
}

declare global {
  interface WindowEventMap extends SoundEventMap {}
}

class SoundSystem {
  private ctx: AudioContext | null = null
  private enabled = false
  private initialized = false

  /**
   * Initialize the AudioContext. Must be called from a user gesture
   * (click, keydown, etc) — browser policy. Safe to call multiple times.
   */
  init() {
    if (typeof window === 'undefined') return
    if (this.initialized) return
    try {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      this.ctx = new AC()
      this.initialized = true
      this.enabled = localStorage.getItem(STORAGE_KEY) === 'true'
    } catch {
      // AudioContext unavailable — silently disable
      this.initialized = false
      this.enabled = false
    }
  }

  /** Returns current enabled state. */
  isEnabled(): boolean {
    return this.enabled && this.initialized
  }

  /** Toggle sound on/off and persist preference. */
  toggle(on: boolean) {
    this.enabled = on
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, String(on))
    // Broadcast so UI toggles stay in sync
    window.dispatchEvent(
      new CustomEvent('sounds:change', { detail: { enabled: on } })
    )
  }

  /** Read persisted preference without initializing the context. */
  getStoredPreference(): boolean {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(STORAGE_KEY) === 'true'
  }

  /* --- Internal note player --- */
  private play(
    frequency: number,
    type: OscType,
    duration: number,
    volume: number,
    delay = 0
  ) {
    if (!this.ctx || !this.enabled) return
    try {
      // Resume context if it was suspended (some browsers)
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {})
      }
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.type = type
      const t0 = this.ctx.currentTime + delay
      osc.frequency.setValueAtTime(frequency, t0)
      gain.gain.setValueAtTime(0, t0)
      gain.gain.linearRampToValueAtTime(volume, t0 + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration)
      osc.start(t0)
      osc.stop(t0 + duration + 0.02)
    } catch {
      // Swallow errors — sounds should never break the app
    }
  }

  /* ============================================================
     PUBLIC SOUND EVENTS
     ============================================================ */

  /** Clean trade logged — C-E-G rising triad (positive chime). */
  tradeLogged() {
    this.play(523, 'sine', 0.3, 0.15) // C5
    this.play(659, 'sine', 0.3, 0.12, 0.1) // E5
    this.play(784, 'sine', 0.4, 0.1, 0.2) // G5
  }

  /** Rule violation — low warning tone pair. */
  violation() {
    this.play(220, 'sine', 0.4, 0.2)
    this.play(185, 'sine', 0.5, 0.15, 0.15)
  }

  /** Session locked — deep resonant thud. */
  sessionLocked() {
    this.play(80, 'sine', 0.8, 0.3)
    this.play(120, 'square', 0.3, 0.1, 0.1)
  }

  /** Cooldown started — descending tones. */
  cooldownStarted() {
    this.play(440, 'sine', 0.25, 0.12)
    this.play(330, 'sine', 0.25, 0.1, 0.15)
    this.play(220, 'sine', 0.35, 0.08, 0.3)
  }

  /** Session clean / high score — subtle success ping. */
  cleanSession() {
    this.play(880, 'sine', 0.2, 0.08)
    this.play(1047, 'sine', 0.3, 0.06, 0.1)
  }

  /** Warning — single double-pulse alert. */
  warning() {
    this.play(330, 'triangle', 0.3, 0.18)
    this.play(330, 'triangle', 0.3, 0.12, 0.35)
  }
}

export const sounds = new SoundSystem()

/* ============================================================
   Install — mount once globally to:
   1) init the AudioContext on the first user gesture
   2) listen for live toggle changes
   ============================================================ */
export function installSoundsOnFirstGesture() {
  if (typeof window === 'undefined') return
  const handler = () => {
    sounds.init()
    window.removeEventListener('click', handler)
    window.removeEventListener('keydown', handler)
    window.removeEventListener('touchstart', handler)
  }
  window.addEventListener('click', handler, { once: false })
  window.addEventListener('keydown', handler, { once: false })
  window.addEventListener('touchstart', handler, { once: false })
}
