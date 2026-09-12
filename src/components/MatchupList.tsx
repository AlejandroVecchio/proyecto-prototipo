import { TYPE_ES } from '../lib/i18n'
import { artSprite } from '../lib/artStyles'
import type { Gen1Type, MatchupRow } from '../types'
import { FoldSection } from './FoldSection'

type Props = {
  title: string
  open: boolean
  onToggle: () => void
  rows: MatchupRow[]
  empty: string
  artIndex: number
  onSelectPokemon: (id: number) => void
  onOpenType: (type: Gen1Type) => void
}

export function MatchupList({
  title,
  open,
  onToggle,
  rows,
  empty,
  artIndex,
  onSelectPokemon,
  onOpenType,
}: Props) {
  return (
    <FoldSection title={title} open={open} onToggle={onToggle} className="fold-card">
      {rows.length === 0 ? <p className="empty">{empty}</p> : null}
      {rows.map((row) => (
        <div className="match-row" key={row.type}>
          <div className="match-head">
            <span className="badge">{TYPE_ES[row.type as Gen1Type]}</span> ×{row.multiplier}
          </div>
          <div className="match-ex">
            {row.examples.map((ex) => (
              <button className="ex" type="button" data-gb-nav key={ex.id} onClick={() => onSelectPokemon(ex.id)}>
                <img key={`${ex.id}-${artIndex}`} src={artSprite(ex.id, artIndex)} alt={ex.name} />
                <span>{ex.name}</span>
              </button>
            ))}
            <button
              className="plus-btn"
              type="button"
              data-gb-nav
              aria-label={`Todos los Pokémon de tipo ${TYPE_ES[row.type]}`}
              onClick={() => onOpenType(row.type)}
            >
              +
            </button>
          </div>
        </div>
      ))}
    </FoldSection>
  )
}
