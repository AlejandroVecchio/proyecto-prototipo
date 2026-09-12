import type { CSSProperties } from 'react'

type Props = {
  seed: number
}

const STARS = Array.from({ length: 12 }, (_, i) => i)

export function ShinyBurst({ seed }: Props) {
  return (
    <div className="shiny-burst" aria-hidden="true">
      <span className="shiny-flash" />
      {STARS.map((i) => {
        const angle = ((i * 30 + (seed % 17)) * Math.PI) / 180
        const dist = 42 + (i % 4) * 8
        return (
          <span
            className="shiny-star"
            key={`${seed}-${i}`}
            style={
              {
                '--dx': `${Math.cos(angle) * dist}px`,
                '--dy': `${Math.sin(angle) * dist}px`,
                '--delay': `${i * 28}ms`,
              } as CSSProperties
            }
          />
        )
      })}
    </div>
  )
}
