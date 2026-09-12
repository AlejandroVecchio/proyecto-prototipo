export type PadDir = 'up' | 'down' | 'left' | 'right'

function navItems(lcd: HTMLElement): HTMLElement[] {
  return [...lcd.querySelectorAll<HTMLElement>('[data-gb-nav]')].filter(
    (el) =>
      !el.hasAttribute('disabled') &&
      !(el as HTMLButtonElement).disabled &&
      !el.closest('[inert]'),
  )
}

function scoreCandidate(dir: PadDir, from: DOMRect, to: DOMRect): number | null {
  const ax = from.left + from.width / 2
  const ay = from.top + from.height / 2
  const bx = to.left + to.width / 2
  const by = to.top + to.height / 2
  const dx = bx - ax
  const dy = by - ay
  const overlapX = Math.min(from.right, to.right) - Math.max(from.left, to.left)
  const overlapY = Math.min(from.bottom, to.bottom) - Math.max(from.top, to.top)

  if (dir === 'up' && dy >= -4) return null
  if (dir === 'down' && dy <= 4) return null
  if (dir === 'left' && dx >= -4) return null
  if (dir === 'right' && dx <= 4) return null

  const primary = dir === 'left' || dir === 'right' ? Math.abs(dx) : Math.abs(dy)
  const secondary = dir === 'left' || dir === 'right' ? Math.abs(dy) : Math.abs(dx)
  const aligned = dir === 'left' || dir === 'right' ? overlapY : overlapX
  const alignBonus = aligned > 0 ? -80 : 0
  return primary + secondary * 3 + alignBonus
}

export function moveGbFocus(lcd: HTMLElement, dir: PadDir): HTMLElement | null {
  const items = navItems(lcd)
  if (!items.length) return null

  const active = document.activeElement
  const current = items.find((el) => el === active) ?? items[0]

  if (current.tagName === 'SELECT' && (dir === 'left' || dir === 'right')) {
    cycleSelect(current as HTMLSelectElement, dir === 'right' ? 1 : -1)
    current.focus()
    return current
  }

  const from = current.getBoundingClientRect()
  let best: HTMLElement | null = null
  let bestScore = Infinity

  for (const el of items) {
    if (el === current) continue
    const score = scoreCandidate(dir, from, el.getBoundingClientRect())
    if (score === null || score >= bestScore) continue
    bestScore = score
    best = el
  }

  if (!best) {
    const idx = items.indexOf(current)
    if (dir === 'down' || dir === 'right') best = items[(idx + 1) % items.length]
    else best = items[(idx - 1 + items.length) % items.length]
  }

  best.focus()
  best.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  return best
}

export function activateGbFocus(lcd: HTMLElement) {
  const items = navItems(lcd)
  const active = document.activeElement
  const current = items.find((el) => el === active) ?? items[0]
  if (!current) return
  current.focus()
  if (current.tagName === 'SELECT') {
    cycleSelect(current as HTMLSelectElement, 1)
    return
  }
  current.click()
}

export function focusFirstNav(lcd: HTMLElement) {
  const items = navItems(lcd)
  const preferred = items.find((el) => el.hasAttribute('data-gb-default'))
  ;(preferred ?? items[0])?.focus()
}

function cycleSelect(select: HTMLSelectElement, step: number) {
  const count = select.options.length
  if (!count) return
  select.selectedIndex = (select.selectedIndex + step + count) % count
  select.dispatchEvent(new Event('change', { bubbles: true }))
}
