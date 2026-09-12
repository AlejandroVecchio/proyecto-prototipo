export const KANTO_MAX = 151

export const POKEMON_TYPES = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'steel',
  'dark',
  'fairy',
] as const

export type Gen1Type = (typeof POKEMON_TYPES)[number]

export type NamedResource = {
  name: string
  url: string
}

export type PokemonTypeSlot = {
  slot: number
  type: NamedResource
}

export type PokemonSprites = {
  front_default: string | null
  versions: {
    'generation-i': {
      'red-blue': {
        front_default: string | null
        front_gray: string | null
        front_transparent: string | null
      }
      yellow: {
        front_default: string | null
        front_gray: string | null
        front_transparent: string | null
      }
    }
  }
}

export type Pokemon = {
  id: number
  name: string
  types: PokemonTypeSlot[]
  sprites: PokemonSprites
  species: NamedResource
  location_area_encounters: string
}

export type SpeciesName = {
  name: string
  language: NamedResource
}

export type PokemonSpecies = {
  id: number
  name: string
  names: SpeciesName[]
  evolution_chain: { url: string }
}

export type EvolutionDetail = {
  min_level: number | null
  trigger: NamedResource
  item: NamedResource | null
}

export type ChainLink = {
  species: NamedResource
  evolution_details: EvolutionDetail[]
  evolves_to: ChainLink[]
}

export type EvolutionChain = {
  id: number
  chain: ChainLink
}

export type EncounterDetail = {
  chance: number
  min_level: number
  max_level: number
  method: NamedResource
}

export type VersionEncounter = {
  max_chance: number
  version: NamedResource
  encounter_details: EncounterDetail[]
}

export type LocationEncounter = {
  location_area: NamedResource
  version_details: VersionEncounter[]
}

export type TypeRelations = {
  double_damage_from: NamedResource[]
  double_damage_to: NamedResource[]
  half_damage_from: NamedResource[]
  half_damage_to: NamedResource[]
  no_damage_from: NamedResource[]
  no_damage_to: NamedResource[]
}

export type TypePokemonEntry = {
  pokemon: NamedResource
  slot: number
}

export type TypeResource = {
  name: string
  damage_relations: TypeRelations
  pokemon: TypePokemonEntry[]
}

export type Generation = {
  pokemon_species: NamedResource[]
}

export type EvolutionStage = {
  id: number
  name: string
  sprite: string
  method?: string
}

export type TypeExample = {
  id: number
  name: string
  sprite: string
  types: string[]
}

export type MatchupRow = {
  type: Gen1Type
  multiplier: number
  examples: TypeExample[]
}

export type EncounterRow = {
  area: string
  method: string
  minLevel: number
  maxLevel: number
  chance: number
}
