import { useCallback, useEffect, useRef, useState } from 'react'
import { GameBoyShell } from './components/GameBoyShell'
import { MainMenu } from './components/MainMenu'
import { PokemonView } from './components/PokemonView'
import {
  getKantoIds,
  isFullBundleCached,
  loadPokemonBundle,
  loadPokemonDetails,
  loadPokemonPreview,
  type PokemonPreview,
} from './api/pokeapi'
import type { KantoVersionId } from './lib/versions'
import { artIndexForVersion, artLabel, nextArtIndex } from './lib/artStyles'
import { TypeDexView } from './components/TypeDexView'
import type { Gen1Type } from './types'

type Screen = 'menu' | 'pokemon' | 'typeDex'

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu')
  const [ids, setIds] = useState<number[]>([])
  const [data, setData] = useState<PokemonPreview | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [version, setVersion] = useState<KantoVersionId>('firered')
  const [artIndex, setArtIndex] = useState(() => artIndexForVersion('firered'))
  const [typeDex, setTypeDex] = useState<Gen1Type | null>(null)
  const [keepRefreshFocus, setKeepRefreshFocus] = useState(false)
  const requestId = useRef(0)

  useEffect(() => {
    getKantoIds()
      .then(setIds)
      .catch(() => setError('No se pudo cargar la Pokédex.'))
  }, [])

  const openPokemon = useCallback(async (id: number, detail = true) => {
    if (detail) setKeepRefreshFocus(false)
    const token = ++requestId.current
    setLoading(true)
    setError(null)
    try {
      const ready = isFullBundleCached(id)
      if (detail || ready) {
        const bundle = await loadPokemonBundle(id)
        if (token !== requestId.current) return
        setData(bundle)
        setShowDetail(true)
      } else {
        const preview = await loadPokemonPreview(id)
        if (token !== requestId.current) return
        setData(preview)
        setShowDetail(false)
      }
      setScreen('pokemon')
      setTypeDex(null)
    } catch {
      if (token !== requestId.current) return
      setError('Fallo al consultar PokéAPI.')
    } finally {
      if (token === requestId.current) setLoading(false)
    }
  }, [])

  const openDetail = useCallback(async () => {
    if (!data || showDetail) return
    const token = ++requestId.current
    setLoading(true)
    setError(null)
    try {
      const bundle = await loadPokemonDetails(data)
      if (token !== requestId.current) return
      setData(bundle)
      setShowDetail(true)
    } catch {
      if (token !== requestId.current) return
      setError('Fallo al consultar PokéAPI.')
    } finally {
      if (token === requestId.current) setLoading(false)
    }
  }, [data, showDetail])

  const randomize = useCallback(async () => {
    if (!ids.length || loading) return
    setKeepRefreshFocus(screen === 'pokemon')
    await openPokemon(ids[Math.floor(Math.random() * ids.length)], false)
  }, [ids, loading, openPokemon, screen])

  const setGameVersion = (next: KantoVersionId) => {
    setVersion(next)
    setArtIndex(artIndexForVersion(next))
  }

  return (
    <GameBoyShell
      onCycleArt={() => setArtIndex((i) => nextArtIndex(i))}
      artLabel={artLabel(version, artIndex)}
      focusKey={`${screen}-${data?.pokemon.id ?? 'none'}-${showDetail}-${typeDex ?? ''}-${keepRefreshFocus ? 'refresh' : 'hero'}`}
    >
      {error ? <p className="status">{error}</p> : null}
      {!error && screen === 'menu' ? (
        <MainMenu onRandom={randomize} loading={loading || ids.length === 0} />
      ) : null}
      {!error && screen === 'typeDex' && typeDex ? (
        <TypeDexView
          type={typeDex}
          artIndex={artIndex}
          onBack={() => {
            setTypeDex(null)
            setScreen('pokemon')
            setShowDetail(true)
          }}
          onSelectPokemon={(id) => openPokemon(id, true)}
        />
      ) : null}
      {!error && screen === 'pokemon' && data ? (
        <PokemonView
          data={data}
          showDetail={showDetail}
          onOpenDetail={openDetail}
          onBack={() => {
            setScreen('menu')
            setShowDetail(false)
            setTypeDex(null)
            setKeepRefreshFocus(false)
          }}
          onRandom={randomize}
          loading={loading}
          keepRefreshFocus={keepRefreshFocus}
          version={version}
          onVersion={setGameVersion}
          artIndex={artIndex}
          onSelectPokemon={openPokemon}
          onOpenType={(type) => {
            setTypeDex(type)
            setScreen('typeDex')
          }}
        />
      ) : null}
      {!error && screen === 'pokemon' && !data && loading ? (
        <p className="status">Cargando...</p>
      ) : null}
    </GameBoyShell>
  )
}
