import { KANTO_MAX, POKEMON_TYPES, type ChainLink, type EncounterRow, type EvolutionChain, type EvolutionStage, type Generation, type LocationEncounter, type MatchupRow, type Pokemon, type PokemonSpecies, type TypeExample, type TypeResource, type TypeRelations } from '../types'
import { formatMethod, formatSlugEs, capitalize } from '../lib/i18n'
import { defensiveMultiplier, offensiveMultiplier } from '../lib/matchups'

const BASE = 'https://pokeapi.co/api/v2'

function idFromUrl(url: string): number {
  const parts = url.replace(/\/$/, '').split('/')
  return Number(parts[parts.length - 1])
}

async function cachedGet<T>(key: string, url: string): Promise<T> {
  const hit = sessionStorage.getItem(key)
  if (hit) return JSON.parse(hit) as T
  const res = await fetch(url)
  if (!res.ok) throw new Error(`No se pudo cargar ${url}`)
  const data = (await res.json()) as T
  try {
    sessionStorage.setItem(key, JSON.stringify(data))
  } catch {
    /* quota */
  }
  return data
}

function isKantoId(id: number) {
  return Number.isFinite(id) && id >= 1 && id <= KANTO_MAX
}

export async function getKantoIds(): Promise<number[]> {
  const gen = await cachedGet<Generation>('gen-1', `${BASE}/generation/1/`)
  return gen.pokemon_species
    .map((s) => idFromUrl(s.url))
    .filter(isKantoId)
    .sort((a, b) => a - b)
}

export async function getPokemon(id: number): Promise<Pokemon> {
  if (id < 1) throw new Error('Pokémon inválido')
  return cachedGet<Pokemon>(`pokemon-${id}`, `${BASE}/pokemon/${id}/`)
}

export async function getSpecies(id: number): Promise<PokemonSpecies> {
  return cachedGet<PokemonSpecies>(`species-${id}`, `${BASE}/pokemon-species/${id}/`)
}

export async function getType(name: string): Promise<TypeResource> {
  return cachedGet<TypeResource>(`type-${name}`, `${BASE}/type/${name}/`)
}

async function getEncounters(id: number): Promise<LocationEncounter[]> {
  return cachedGet<LocationEncounter[]>(`enc-${id}`, `${BASE}/pokemon/${id}/encounters`)
}

async function getEvolutionChain(url: string): Promise<EvolutionChain> {
  const id = idFromUrl(url)
  return cachedGet<EvolutionChain>(`evo-${id}`, url)
}

export function defaultSpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
}

export function pokemonSprite(pokemon: Pokemon): string {
  return pokemon.sprites.front_default || defaultSpriteUrl(pokemon.id)
}

export function spanishName(species: PokemonSpecies): string {
  return species.names.find((n) => n.language.name === 'es')?.name ?? capitalize(species.name)
}

function walkChain(link: ChainLink, method: string | undefined, acc: EvolutionStage[]) {
  const id = idFromUrl(link.species.url)
  if (isKantoId(id)) {
    acc.push({
      id,
      name: capitalize(link.species.name),
      sprite: defaultSpriteUrl(id),
      method,
    })
    for (const next of link.evolves_to) {
      walkChain(next, describeEvolution(next), acc)
    }
  }
}

function describeEvolution(link: ChainLink): string {
  const detail = link.evolution_details[0]
  if (!detail) return ''
  if (detail.min_level) return `Nv. ${detail.min_level}`
  if (detail.item) return capitalize(detail.item.name.replace(/-/g, ' '))
  if (detail.trigger.name === 'trade') return 'Intercambio'
  if (detail.trigger.name === 'use-item') return 'Objeto'
  return capitalize(detail.trigger.name.replace(/-/g, ' '))
}

export async function getEvolutions(species: PokemonSpecies): Promise<EvolutionStage[]> {
  const chain = await getEvolutionChain(species.evolution_chain.url)
  const stages: EvolutionStage[] = []
  walkChain(chain.chain, undefined, stages)
  const unique = [...new Map(stages.map((s) => [s.id, s])).values()]
  return Promise.all(
    unique.map(async (stage) => {
      const sp = await getSpecies(stage.id)
      return { ...stage, name: spanishName(sp) }
    }),
  )
}

export function encountersForVersion(
  encounters: LocationEncounter[],
  version: string,
): EncounterRow[] {
  const rows: EncounterRow[] = []
  for (const entry of encounters) {
    const vd = entry.version_details.find((v) => v.version.name === version)
    if (!vd) continue
    const grouped = new Map<string, EncounterRow>()
    for (const d of vd.encounter_details) {
      const key = d.method.name
      const prev = grouped.get(key)
      if (!prev) {
        grouped.set(key, {
          area: formatSlugEs(entry.location_area.name),
          method: formatMethod(d.method.name),
          minLevel: d.min_level,
          maxLevel: d.max_level,
          chance: d.chance,
        })
      } else {
        prev.minLevel = Math.min(prev.minLevel, d.min_level)
        prev.maxLevel = Math.max(prev.maxLevel, d.max_level)
        prev.chance = Math.max(prev.chance, d.chance)
      }
    }
    rows.push(...grouped.values())
  }
  return rows
}

function pickDiverseIds(ids: number[], count: number, rotateBy: number): number[] {
  const unique = [...new Set(ids)]
  if (unique.length <= count) return unique
  const start = ((rotateBy % unique.length) + unique.length) % unique.length
  const rotated = [...unique.slice(start), ...unique.slice(0, start)]
  const picked: number[] = []
  const farEnough = (id: number) => picked.every((p) => Math.abs(p - id) >= 3)

  for (let i = 0; i < rotated.length && picked.length < count; i++) {
    const idx = Math.floor((i * rotated.length) / count) % rotated.length
    const candidate = rotated[idx]
    if (!picked.includes(candidate) && farEnough(candidate)) picked.push(candidate)
  }
  for (const id of rotated) {
    if (picked.length >= count) break
    if (!picked.includes(id) && farEnough(id)) picked.push(id)
  }
  for (const id of rotated) {
    if (picked.length >= count) break
    if (!picked.includes(id)) picked.push(id)
  }
  return picked
}

async function examplesForType(typeName: string, excludeIds: Set<number>): Promise<TypeExample[]> {
  const type = await getType(typeName)
  const pool = type.pokemon
    .map((p) => ({ id: idFromUrl(p.pokemon.url), slot: p.slot }))
    .filter((p) => isKantoId(p.id) && !excludeIds.has(p.id))

  const primary = pool.filter((p) => p.slot === 1).map((p) => p.id)
  const others = pool.filter((p) => p.slot !== 1).map((p) => p.id)
  const seed = [...excludeIds][0] ?? 1
  const picked = pickDiverseIds([...primary, ...others], 3, seed * 11 + typeName.length)

  return Promise.all(picked.map((id) => toExample(id)))
}

async function toExample(id: number): Promise<TypeExample> {
  try {
    const poke = await getPokemon(id)
    const species = await getSpecies(id)
    return {
      id,
      name: spanishName(species),
      sprite: pokemonSprite(poke),
      types: poke.types.map((slot) => slot.type.name),
    }
  } catch {
    return {
      id,
      name: `#${id}`,
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
      types: [],
    }
  }
}

export async function getPokemonByType(typeName: string): Promise<TypeExample[]> {
  const type = await getType(typeName)
  const ids = [
    ...new Set(
      type.pokemon
        .map((p) => idFromUrl(p.pokemon.url))
        .filter((id) => isKantoId(id)),
    ),
  ].sort((a, b) => a - b)
  return Promise.all(ids.map((id) => toExample(id)))
}

export async function getMatchups(pokemon: Pokemon, excludeIds: Set<number>): Promise<{
  counters: MatchupRow[]
  beats: MatchupRow[]
}> {
  const defenderTypes = pokemon.types.map((t) => t.type.name)
  const charts: Record<string, TypeRelations> = {}
  const needed = new Set([...defenderTypes, ...POKEMON_TYPES])
  await Promise.all(
    [...needed].map(async (name) => {
      charts[name] = (await getType(name)).damage_relations
    }),
  )

  const counterDefs = POKEMON_TYPES.map((type) => ({
    type,
    multiplier: defensiveMultiplier(type, defenderTypes, charts),
  })).filter((row) => row.multiplier >= 2)

  const beatDefs = POKEMON_TYPES.map((type) => ({
    type,
    multiplier: offensiveMultiplier(defenderTypes, type, charts),
  })).filter((row) => row.multiplier >= 2)

  const [counters, beats] = await Promise.all([
    Promise.all(
      counterDefs.map(async (row) => ({
        ...row,
        examples: await examplesForType(row.type, excludeIds),
      })),
    ),
    Promise.all(
      beatDefs.map(async (row) => ({
        ...row,
        examples: await examplesForType(row.type, excludeIds),
      })),
    ),
  ])

  counters.sort((a, b) => b.multiplier - a.multiplier)
  beats.sort((a, b) => b.multiplier - a.multiplier)
  return { counters, beats }
}

export type PokemonPreview = {
  pokemon: Pokemon
  species: PokemonSpecies
  displayName: string
  sprite: string
}

export type PokemonBundle = PokemonPreview & {
  evolutions: EvolutionStage[]
  encounters: LocationEncounter[]
  matchups: Awaited<ReturnType<typeof getMatchups>>
}

export function isPokemonBundle(data: PokemonPreview | PokemonBundle): data is PokemonBundle {
  return 'matchups' in data
}

function bundleReadyKey(id: number) {
  return `bundle-ready-${id}`
}

export function isFullBundleCached(id: number) {
  return sessionStorage.getItem(bundleReadyKey(id)) === '1'
}

export async function loadPokemonPreview(id: number) {
  const pokemon = await getPokemon(id)
  const species = await getSpecies(id)
  return {
    pokemon,
    species,
    displayName: spanishName(species),
    sprite: pokemonSprite(pokemon),
  }
}

export async function loadPokemonDetails(preview: PokemonPreview): Promise<PokemonBundle> {
  const { pokemon, species } = preview
  const [evolutions, encounters] = await Promise.all([
    getEvolutions(species),
    getEncounters(pokemon.id),
  ])
  const excludeIds = new Set([pokemon.id, ...evolutions.map((evo) => evo.id)])
  const matchups = await getMatchups(pokemon, excludeIds)
  const bundle = {
    ...preview,
    evolutions,
    encounters,
    matchups,
  }
  try {
    sessionStorage.setItem(bundleReadyKey(pokemon.id), '1')
  } catch {
    /* quota */
  }
  return bundle
}

export async function loadPokemonBundle(id: number) {
  const preview = await loadPokemonPreview(id)
  return loadPokemonDetails(preview)
}
