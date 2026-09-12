import type { KantoVersionId } from './versions'
import { KANTO_VERSIONS } from './versions'

const SHINY_DEFAULT = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`

export const ART_STYLES = [
  {
    id: 'red-blue',
    label: 'Rojo / Azul',
    src: (id: number) =>
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-i/red-blue/${id}.png`,
    shiny: SHINY_DEFAULT,
  },
  {
    id: 'yellow',
    label: 'Amarillo',
    src: (id: number) =>
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-i/yellow/${id}.png`,
    shiny: SHINY_DEFAULT,
  },
  {
    id: 'gold',
    label: 'Oro',
    src: (id: number) =>
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-ii/gold/${id}.png`,
    shiny: (id: number) =>
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-ii/gold/shiny/${id}.png`,
  },
  {
    id: 'silver',
    label: 'Plata',
    src: (id: number) =>
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-ii/silver/${id}.png`,
    shiny: (id: number) =>
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-ii/silver/shiny/${id}.png`,
  },
  {
    id: 'crystal',
    label: 'Cristal',
    src: (id: number) =>
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-ii/crystal/${id}.png`,
    shiny: (id: number) =>
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-ii/crystal/shiny/${id}.png`,
  },
  {
    id: 'ruby-sapphire',
    label: 'Rubí / Zafiro',
    src: (id: number) =>
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/ruby-sapphire/${id}.png`,
    shiny: (id: number) =>
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/ruby-sapphire/shiny/${id}.png`,
  },
  {
    id: 'emerald',
    label: 'Esmeralda',
    src: (id: number) =>
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/emerald/${id}.png`,
    shiny: (id: number) =>
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/emerald/shiny/${id}.png`,
  },
  {
    id: 'firered-leafgreen',
    label: 'Rojo Fuego / Verde Hoja',
    src: (id: number) =>
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/${id}.png`,
    shiny: (id: number) =>
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/shiny/${id}.png`,
  },
  {
    id: 'lets-go',
    label: "Let's Go",
    src: (id: number) =>
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
    shiny: SHINY_DEFAULT,
  },
] as const

export type ArtStyleId = (typeof ART_STYLES)[number]['id']

const VERSION_ART: Record<KantoVersionId, ArtStyleId> = {
  red: 'red-blue',
  blue: 'red-blue',
  yellow: 'yellow',
  firered: 'firered-leafgreen',
  leafgreen: 'firered-leafgreen',
  'lets-go-pikachu': 'lets-go',
  'lets-go-eevee': 'lets-go',
}

export function artIndexForVersion(version: KantoVersionId): number {
  const id = VERSION_ART[version]
  const index = ART_STYLES.findIndex((style) => style.id === id)
  return index < 0 ? 0 : index
}

export function artLabel(version: KantoVersionId, artIndex: number): string {
  if (artIndexForVersion(version) === artIndex) {
    return KANTO_VERSIONS.find((item) => item.id === version)?.label ?? ART_STYLES[artIndex].label
  }
  return ART_STYLES[artIndex].label
}

export function nextArtIndex(index: number): number {
  return (index + 1) % ART_STYLES.length
}

export function defaultSprite(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
}

const STYLE_MAX_ID: Record<string, number> = {
  'red-blue': 151,
  yellow: 151,
  gold: 251,
  silver: 251,
  crystal: 251,
  'ruby-sapphire': 386,
  emerald: 386,
  'firered-leafgreen': 386,
  'lets-go': 809,
}

export function artSprite(id: number, styleIndex: number, shiny = false): string {
  const style = ART_STYLES[styleIndex] ?? ART_STYLES[0]
  const max = STYLE_MAX_ID[style.id] ?? 151
  if (id > max) return shiny ? SHINY_DEFAULT(id) : defaultSprite(id)
  if (shiny) return style.shiny(id)
  return style.src(id)
}
