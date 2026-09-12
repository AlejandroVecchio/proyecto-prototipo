import type { PokemonBundle, PokemonPreview } from '../api/pokeapi'
import { isPokemonBundle } from '../api/pokeapi'
import type { KantoVersionId } from '../lib/versions'
import { artLabel, artSprite } from '../lib/artStyles'
import { padDex } from '../lib/i18n'
import { TYPE_ES } from '../lib/i18n'
import type { Gen1Type } from '../types'
import { PokemonDetail } from './PokemonDetail'

type Props = {
  data: PokemonPreview | PokemonBundle
  showDetail: boolean
  onOpenDetail: () => void
  onBack: () => void
  onRandom: () => void
  loading: boolean
  keepRefreshFocus: boolean
  version: KantoVersionId
  onVersion: (version: KantoVersionId) => void
  artIndex: number
  onSelectPokemon: (id: number) => void
  onOpenType: (type: Gen1Type) => void
}

export function PokemonView({
  data,
  showDetail,
  onOpenDetail,
  onBack,
  onRandom,
  loading,
  keepRefreshFocus,
  version,
  onVersion,
  artIndex,
  onSelectPokemon,
  onOpenType,
}: Props) {
  return (
    <div className="poke-view">
      <div className="top-bar">
        <button className="lcd-btn" type="button" data-gb-nav data-gb-back onClick={onBack}>
          Menú
        </button>
        <button
          className={loading ? 'lcd-btn icon-btn is-busy' : 'lcd-btn icon-btn'}
          type="button"
          data-gb-nav
          data-gb-default={keepRefreshFocus ? true : undefined}
          aria-label="Otro Pokémon"
          aria-busy={loading}
          title="Otro"
          onClick={onRandom}
        >
          <svg className={loading ? 'refresh-icon is-spinning' : 'refresh-icon'} viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M17.65 6.35A7.96 7.96 0 0 0 12 4a8 8 0 1 0 7.73 10h-2.08A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z"
            />
          </svg>
        </button>
      </div>

      <button
        className="hero"
        type="button"
        data-gb-nav
        data-gb-default={keepRefreshFocus ? undefined : true}
        onClick={onOpenDetail}
      >
        <img key={`${data.pokemon.id}-${artIndex}`} src={artSprite(data.pokemon.id, artIndex)} alt={data.displayName} />
        <p className="dex">
          Nº{padDex(data.pokemon.id)} {data.displayName.toUpperCase()}
        </p>
        <div className="types">
          {data.pokemon.types.map((t) => (
            <span className="badge" key={t.slot}>
              {TYPE_ES[t.type.name as Gen1Type] ?? t.type.name}
            </span>
          ))}
        </div>
      </button>

      <p className="art-label">SELECT · {artLabel(version, artIndex)}</p>
      {!showDetail ? (
        <p className="hint blink">{loading ? 'Cargando...' : 'PRESS START para elegir'}</p>
      ) : null}

      {showDetail && isPokemonBundle(data) ? (
        <PokemonDetail
          data={data}
          version={version}
          onVersion={onVersion}
          artIndex={artIndex}
          onSelectPokemon={onSelectPokemon}
          onOpenType={onOpenType}
        />
      ) : null}
    </div>
  )
}
