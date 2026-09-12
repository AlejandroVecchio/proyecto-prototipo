import { useEffect, useState } from 'react'
import { KANTO_VERSIONS, type KantoVersionId } from '../lib/versions'
import { TYPE_ES } from '../lib/i18n'
import { padDex } from '../lib/i18n'
import type { Gen1Type } from '../types'
import type { PokemonBundle } from '../api/pokeapi'
import { encountersForVersion } from '../api/pokeapi'
import { artSprite } from '../lib/artStyles'
import { MatchupList } from './MatchupList'
import { FoldSection } from './FoldSection'

type Props = {
  data: PokemonBundle
  version: KantoVersionId
  onVersion: (version: KantoVersionId) => void
  artIndex: number
  onSelectPokemon: (id: number) => void
  onOpenType: (type: Gen1Type) => void
}

const CLOSED_ALL = { beats: false, counters: false, places: false }

export function PokemonDetail({ data, version, onVersion, artIndex, onSelectPokemon, onOpenType }: Props) {
  const places = encountersForVersion(data.encounters, version)
  const [open, setOpen] = useState(CLOSED_ALL)

  useEffect(() => {
    setOpen(CLOSED_ALL)
  }, [data.pokemon.id])

  const toggle = (key: keyof typeof CLOSED_ALL) => {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div>
      <section className="section">
        <h2>Evoluciones</h2>
        <div className="evo-row">
          {data.evolutions.map((evo) => (
            <div className="evo" key={evo.id}>
              <span className="evo-method">{evo.method ?? ''}</span>
              <img key={`${evo.id}-${artIndex}`} src={artSprite(evo.id, artIndex)} alt={evo.name} />
              <span className="evo-name">
                Nº{padDex(evo.id)} {evo.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="fold-stack">
        <MatchupList
          title="Le gana a"
          open={open.beats}
          onToggle={() => toggle('beats')}
          rows={data.matchups.beats}
          artIndex={artIndex}
          onSelectPokemon={onSelectPokemon}
          onOpenType={onOpenType}
          empty="No tiene ventajas claras de tipo."
        />
        <MatchupList
          title="Counters"
          open={open.counters}
          onToggle={() => toggle('counters')}
          rows={data.matchups.counters}
          artIndex={artIndex}
          onSelectPokemon={onSelectPokemon}
          onOpenType={onOpenType}
          empty="Nadie le hace daño super efectivo."
        />
        <FoldSection title="Dónde encontrarlo" open={open.places} onToggle={() => toggle('places')} className="fold-card">
          <label>
            Versión
            <select
              className="version"
              data-gb-nav
              value={version}
              onChange={(e) => onVersion(e.target.value as KantoVersionId)}
            >
              {KANTO_VERSIONS.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </label>
          {places.length === 0 ? (
            <p className="empty">No se encuentra en esta versión.</p>
          ) : (
            places.map((p, i) => (
              <p className="place" key={`${p.area}-${p.method}-${i}`}>
                {p.area} · {p.method} · Nv.{p.minLevel}
                {p.maxLevel !== p.minLevel ? `-${p.maxLevel}` : ''} · {p.chance}%
              </p>
            ))
          )}
        </FoldSection>
      </section>

      <p className="hint">
        Tipo: {data.pokemon.types.map((t) => TYPE_ES[t.type.name as Gen1Type] ?? t.type.name).join(' / ')}
      </p>
    </div>
  )
}
