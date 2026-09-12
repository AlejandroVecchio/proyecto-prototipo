type Cue = 'move' | 'confirm' | 'back' | 'select' | 'power' | 'shiny'

/** `menu` = set actual. `classic` = blips anteriores; volver a ese si el usuario lo pide. */
export const SOUND_BANK: 'classic' | 'menu' = 'menu'

let ctx: AudioContext | null = null
let enabled = false
const listeners = new Set<(on: boolean) => void>()

try {
  enabled = localStorage.getItem('gb-sound') === '1'
} catch {
  enabled = false
}

export function isSoundOn() {
  return enabled
}

export function onSoundChange(fn: (on: boolean) => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

function notify() {
  listeners.forEach((fn) => fn(enabled))
}

function unlock() {
  const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioCtx) return null
  if (!ctx) ctx = new AudioCtx()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

export function setSoundOn(on: boolean) {
  enabled = on
  try {
    localStorage.setItem('gb-sound', on ? '1' : '0')
  } catch {
    /* ignore */
  }
  if (on) unlock()
  notify()
  if (on) play('power')
}

export function toggleSound() {
  setSoundOn(!enabled)
}

function beep(audio: AudioContext, freq: number, dur: number, when = 0, vol = 0.07) {
  const t = audio.currentTime + when
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.type = 'square'
  osc.frequency.setValueAtTime(freq, t)
  gain.gain.setValueAtTime(vol, t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur)
  osc.connect(gain)
  gain.connect(audio.destination)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

function playClassic(audio: AudioContext, cue: Cue) {
  if (cue === 'move') {
    beep(audio, 880, 0.045)
    return
  }
  if (cue === 'confirm') {
    beep(audio, 523, 0.055)
    beep(audio, 784, 0.09, 0.055)
    return
  }
  if (cue === 'back') {
    beep(audio, 392, 0.05)
    beep(audio, 262, 0.09, 0.05, 0.06)
    return
  }
  if (cue === 'select') {
    beep(audio, 659, 0.04)
    beep(audio, 659, 0.05, 0.09, 0.05)
    return
  }
  if (cue === 'power') {
    beep(audio, 392, 0.05)
    beep(audio, 523, 0.05, 0.06)
    beep(audio, 659, 0.12, 0.12)
    return
  }
  beep(audio, 784, 0.05)
  beep(audio, 988, 0.05, 0.06)
  beep(audio, 1175, 0.05, 0.12)
  beep(audio, 1568, 0.14, 0.18, 0.06)
}

function playMenu(audio: AudioContext, cue: Cue) {
  if (cue === 'move') {
    beep(audio, 880, 0.045)
    return
  }
  if (cue === 'confirm') {
    beep(audio, 784, 0.032, 0, 0.055)
    beep(audio, 1175, 0.07, 0.034, 0.06)
    return
  }
  if (cue === 'back') {
    beep(audio, 494, 0.03, 0, 0.05)
    beep(audio, 330, 0.08, 0.032, 0.045)
    return
  }
  if (cue === 'select') {
    beep(audio, 988, 0.02, 0, 0.04)
    beep(audio, 988, 0.035, 0.055, 0.035)
    return
  }
  if (cue === 'power') {
    beep(audio, 659, 0.03, 0, 0.045)
    beep(audio, 880, 0.03, 0.04, 0.05)
    beep(audio, 1175, 0.1, 0.08, 0.055)
    return
  }
  beep(audio, 988, 0.03, 0, 0.04)
  beep(audio, 1319, 0.03, 0.045, 0.045)
  beep(audio, 1568, 0.03, 0.09, 0.05)
  beep(audio, 2093, 0.1, 0.135, 0.04)
}

export function play(cue: Cue) {
  if (!enabled) return
  const audio = unlock()
  if (!audio) return
  if (SOUND_BANK === 'classic') playClassic(audio, cue)
  else playMenu(audio, cue)
}
