import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { activateGbFocus, focusFirstNav, moveGbFocus, type PadDir } from '../lib/gbNav'
import { isSoundOn, onSoundChange, play, toggleSound } from '../lib/gbSound'

type Props = {
  children: ReactNode
  onCycleArt: () => void
  artLabel: string
  focusKey: string
}

export function GameBoyShell({ children, onCycleArt, artLabel, focusKey }: Props) {
  const lcdRef = useRef<HTMLDivElement>(null)
  const syntheticClick = useRef(false)
  const [soundOn, setSoundOn] = useState(() => isSoundOn())

  useEffect(() => onSoundChange(setSoundOn), [])

  const pad = (dir: PadDir) => {
    const lcd = lcdRef.current
    if (!lcd) return
    play('move')
    moveGbFocus(lcd, dir)
  }

  const select = () => {
    const lcd = lcdRef.current
    if (!lcd) return
    play('confirm')
    syntheticClick.current = true
    activateGbFocus(lcd)
    syntheticClick.current = false
  }

  const back = () => {
    const lcd = lcdRef.current
    const btn = lcd?.querySelector<HTMLElement>('[data-gb-back]')
    play('back')
    syntheticClick.current = true
    btn?.click()
    syntheticClick.current = false
  }

  const cycleArt = () => {
    play('select')
    onCycleArt()
  }

  useEffect(() => {
    const lcd = lcdRef.current
    if (!lcd) return

    let dragging = false
    let moved = false
    let startY = 0
    let startX = 0
    let startTop = 0
    let startLeft = 0
    let blockClick = false

    const asElement = (target: EventTarget | null): HTMLElement | null => {
      if (target instanceof HTMLElement) return target
      if (target instanceof Node) return target.parentElement
      return null
    }

    const isControl = (target: EventTarget | null) => {
      const el = asElement(target)
      return Boolean(el?.closest('button, select, a, input, label, [data-gb-nav]'))
    }

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      if (isControl(e.target)) return
      dragging = true
      moved = false
      startY = e.clientY
      startX = e.clientX
      startTop = lcd.scrollTop
      startLeft = lcd.scrollLeft
    }

    const onMove = (e: PointerEvent) => {
      if (!dragging) return
      const dy = e.clientY - startY
      const dx = e.clientX - startX
      if (!moved) {
        if (Math.hypot(dx, dy) < 10) return
        moved = true
        lcd.setPointerCapture(e.pointerId)
        lcd.classList.add('is-dragging')
      }
      lcd.scrollTop = startTop - dy
      lcd.scrollLeft = startLeft - dx
    }

    const endDrag = (e: PointerEvent) => {
      if (moved) blockClick = true
      dragging = false
      moved = false
      lcd.classList.remove('is-dragging')
      if (lcd.hasPointerCapture(e.pointerId)) lcd.releasePointerCapture(e.pointerId)
    }

    const onClickCapture = (e: Event) => {
      if (blockClick) {
        blockClick = false
        e.preventDefault()
        e.stopPropagation()
        return
      }
      if (syntheticClick.current) return
      if (isControl(e.target)) play('confirm')
    }

    lcd.addEventListener('pointerdown', onDown)
    lcd.addEventListener('pointermove', onMove)
    lcd.addEventListener('pointerup', endDrag)
    lcd.addEventListener('pointercancel', endDrag)
    lcd.addEventListener('click', onClickCapture, true)

    return () => {
      lcd.removeEventListener('pointerdown', onDown)
      lcd.removeEventListener('pointermove', onMove)
      lcd.removeEventListener('pointerup', endDrag)
      lcd.removeEventListener('pointercancel', endDrag)
      lcd.removeEventListener('click', onClickCapture, true)
    }
  }, [])

  useEffect(() => {
    const lcd = lcdRef.current
    if (!lcd) return
    const id = window.setTimeout(() => focusFirstNav(lcd), 0)
    return () => window.clearTimeout(id)
  }, [focusKey])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        pad('up')
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        pad('down')
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        pad('left')
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        pad('right')
      } else if (e.key === 'Enter') {
        e.preventDefault()
        select()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const hold = (fn: () => void) => (e: MouseEvent) => {
    e.preventDefault()
    fn()
  }

  return (
    <div className="page">
      <div className="gb-shell">
        <div className="gb-shell-top">
          <p className="gb-brand">GAME BOY</p>
          <button
            className={soundOn ? 'gb-sound is-on' : 'gb-sound is-off'}
            type="button"
            tabIndex={-1}
            aria-pressed={soundOn}
            aria-label={soundOn ? 'Sonido activado' : 'Sonido desactivado'}
            title={soundOn ? 'Sonido ON' : 'Sonido OFF'}
            onClick={toggleSound}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M10 4v11.5a3.5 3.5 0 1 0 2 3V9.2l8-1.6V16.5a3.5 3.5 0 1 0 2 3V4.8L10 7.2V4z"
              />
              {soundOn ? null : (
                <path
                  className="gb-sound-slash"
                  d="M4.5 4.5 L19.5 19.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="square"
                />
              )}
            </svg>
          </button>
        </div>
        <div className="gb-screen-frame">
          <div className="gb-screen-dots" aria-hidden="true">
            <span />
            <span />
          </div>
          <div className="gb-lcd" ref={lcdRef}>
            {children}
          </div>
        </div>
        <div className="gb-controls">
          <div className="dpad">
            <button
              className="dpad-hit up"
              type="button"
              tabIndex={-1}
              aria-label="Arriba"
              onMouseDown={hold(() => pad('up'))}
            />
            <button
              className="dpad-hit down"
              type="button"
              tabIndex={-1}
              aria-label="Abajo"
              onMouseDown={hold(() => pad('down'))}
            />
            <button
              className="dpad-hit left"
              type="button"
              tabIndex={-1}
              aria-label="Izquierda"
              onMouseDown={hold(() => pad('left'))}
            />
            <button
              className="dpad-hit right"
              type="button"
              tabIndex={-1}
              aria-label="Derecha"
              onMouseDown={hold(() => pad('right'))}
            />
            <div className="dpad-arm v" />
            <div className="dpad-arm h" />
          </div>
          <div className="ab">
            <button
              className="ab-btn"
              type="button"
              tabIndex={-1}
              aria-label="B"
              onMouseDown={hold(back)}
            >
              B
            </button>
            <button
              className="ab-btn"
              type="button"
              tabIndex={-1}
              aria-label="A"
              onMouseDown={hold(select)}
            >
              A
            </button>
          </div>
        </div>
        <div className="start-select">
          <div className="pill-wrap">
            <button
              className="pill-btn"
              type="button"
              tabIndex={-1}
              onClick={cycleArt}
              aria-label={`Cambiar sprites: ${artLabel}`}
              title={`Sprites: ${artLabel}`}
            >
              <span className="pill" />
              <span>SELECT</span>
            </button>
          </div>
          <div className="pill-wrap">
            <button
              className="pill-btn"
              type="button"
              tabIndex={-1}
              onMouseDown={hold(select)}
              aria-label="Seleccionar"
              title="Seleccionar"
            >
              <span className="pill" />
              <span>START</span>
            </button>
          </div>
        </div>
        <div className="gb-speaker" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      </div>
    </div>
  )
}
