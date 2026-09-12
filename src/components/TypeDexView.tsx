import { useEffect, useState } from 'react'
import { getPokemonByType } from '../api/pokeapi'
import { artSprite } from '../lib/artStyles'
import { padDex, TYPE_ES } from '../lib/i18n'
import type { Gen1Type, TypeExample } from '../types'

type Props = {
  type: Gen1Type
  artIndex: number
  onBack: () => void
  onSelectPokemon: (id: number) => void
}

export function TypeDexView({ type, artIndex, onBack, onSelectPokemon }: Props) {
  const [list, setList] = useState<TypeExample[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    getPokemonByType(type)
      .then((items) => {
        if (alive) setList(items)
      })
      .catch(() => {
        if (alive) setError('No se pudo cargar el tipo.')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [type])

  return (
    <div className="type-dex">
      <div className="top-bar">
        <button className="lcd-btn" type="button" data-gb-nav data-gb-back data-gb-default onClick={onBack}>
          Atrás
        </button>
      </div>
      <h2>TIPO {TYPE_ES[type].toUpperCase()}</h2>
      <p className="hint">
        {loading ? 'Cargando...' : `${list.length} Pokémon de Kanto · mixtos incluidos`}
      </p>
      {error ? <p className="status">{error}</p> : null}
      <div className="type-grid">
        {list.map((poke) => (
          <button
            className="ex"
            type="button"
            data-gb-nav
            key={poke.id}
            onClick={() => onSelectPokemon(poke.id)}
          >
            <img key={`${poke.id}-${artIndex}`} src={artSprite(poke.id, artIndex)} alt={poke.name} />
            <span>
              Nº{padDex(poke.id)} {poke.name}
            </span>
            <span className="type-mini">
              {poke.types
                .map((t) => TYPE_ES[t as Gen1Type] ?? t)
                .join(' / ')}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
