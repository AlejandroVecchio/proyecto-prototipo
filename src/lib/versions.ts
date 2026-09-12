export const KANTO_VERSIONS = [
  { id: 'red', label: 'Rojo' },
  { id: 'blue', label: 'Azul' },
  { id: 'yellow', label: 'Amarillo' },
  { id: 'firered', label: 'Rojo Fuego' },
  { id: 'leafgreen', label: 'Verde Hoja' },
  { id: 'lets-go-pikachu', label: "Let's Go Pikachu" },
  { id: 'lets-go-eevee', label: "Let's Go Eevee" },
] as const

export type KantoVersionId = (typeof KANTO_VERSIONS)[number]['id']
