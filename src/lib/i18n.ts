import type { Gen1Type } from '../types'

export const TYPE_ES: Record<Gen1Type, string> = {
  normal: 'Normal',
  fire: 'Fuego',
  water: 'Agua',
  electric: 'Eléctrico',
  grass: 'Planta',
  ice: 'Hielo',
  fighting: 'Lucha',
  poison: 'Veneno',
  ground: 'Tierra',
  flying: 'Volador',
  psychic: 'Psíquico',
  bug: 'Bicho',
  rock: 'Roca',
  ghost: 'Fantasma',
  dragon: 'Dragón',
  steel: 'Acero',
  dark: 'Siniestro',
  fairy: 'Hada',
}

export const METHOD_ES: Record<string, string> = {
  walk: 'Hierba',
  'old-rod': 'Caña vieja',
  'good-rod': 'Caña buena',
  'super-rod': 'Supercaña',
  surf: 'Surf',
  'rock-smash': 'Golpe Roca',
  headbutt: 'Golpe Cabeza',
  gift: 'Regalo',
  'gift-egg': 'Huevo',
  pokeflute: 'Pokéflauta',
  'only-one': 'Único',
  squid: 'Calamar',
  'devon-scope': 'Detector Devon',
  'island-scan': 'Escáner isla',
  'sos-encounter': 'SOS',
  'sos-from-ally': 'Aliado SOS',
  'bubble-spot': 'Burbujas',
  'lure-spot': 'Cebo',
  'tree-shadow': 'Sombra de árbol',
  'whirl-spots': 'Remolino',
  'feebas-tile-fishing': 'Pesca Feebas',
  'land-on-land': 'Tierra',
  'sky-drops': 'Cielo',
  'dark-grass': 'Hierba oscura',
  'grass-spots': 'Hierba',
  'cave-spots': 'Cueva',
  'bridge-spots': 'Puente',
  'super-rod-spots': 'Supercaña',
  'surf-spots': 'Surf',
  'yellow-flowers': 'Flores amarillas',
  'purple-flowers': 'Flores púrpuras',
  'red-flowers': 'Flores rojas',
  'rough-terrain': 'Terreno irregular',
  'ambush-encounters': 'Emboscada',
  'berry-piles': 'Bayas',
  'from-background': 'Fondo',
}

const LOCATION_ES: Record<string, string> = {
  pallet: 'Pueblo Paleta',
  viridian: 'Ciudad Verde',
  pewter: 'Ciudad Plateada',
  cerulean: 'Ciudad Celeste',
  vermilion: 'Ciudad Carmín',
  lavender: 'Pueblo Lavanda',
  celadon: 'Ciudad Azulona',
  fuchsia: 'Ciudad Fucsia',
  saffron: 'Ciudad Azafrán',
  cinnabar: 'Isla Canela',
  indigo: 'Meseta Añil',
  kanto: 'Kanto',
  mt: 'Monte',
  moon: 'Luna',
  rock: 'Roca',
  tunnel: 'Túnel',
  victory: 'Victoria',
  road: 'Camino',
  route: 'Ruta',
  island: 'Isla',
  cave: 'Cueva',
  forest: 'Bosque',
  gym: 'Gimnasio',
  tower: 'Torre',
  mansion: 'Mansión',
  power: 'Central',
  plant: 'Energía',
  seafoam: 'Islas Espuma',
  islands: 'Islas',
  safari: 'Safari',
  zone: 'Zona',
  gate: 'Puerta',
  city: 'Ciudad',
  town: 'Pueblo',
  'sea-route': 'Ruta marítima',
  'treasure-beach': 'Playa Tesoro',
  'kindle-road': 'Camino Candente',
  'mt-ember': 'Monte Ascuas',
  'cape-brink': 'Cabo Extremo',
  'bond-bridge': 'Puente Unión',
  'berry-forest': 'Bosque Baya',
  'icefall-cave': 'Cueva Cardumen',
  'rocket-warehouse': 'Almacén Rocket',
  'lost-cave': 'Cueva Perdida',
  'pattern-bush': 'Seto Destello',
  'altering-cave': 'Cueva Cambiante',
  'outcast-island': 'Isla Exta',
  'green-path': 'Vía Verde',
  'water-path': 'Vía Acuática',
  'ruin-valley': 'Valle Ruinas',
  'trainer-tower': 'Torre Desafío',
  'canyon-entrance': 'Entrada Cañón',
  'sevault-canyon': 'Cañón Sétano',
  'tanoby-ruins': 'Ruinas Sete',
  'one-island': 'Isla Prima',
  'two-island': 'Isla Secunda',
  'three-island': 'Isla Tera',
  'four-island': 'Isla Quarta',
  'five-island': 'Isla Inta',
  'six-island': 'Isla Exta',
  'seven-island': 'Isla Sétima',
}

export function formatSlugEs(slug: string): string {
  const cleaned = slug.replace(/-area$/i, '').replace(/_/g, '-')
  if (LOCATION_ES[cleaned]) return LOCATION_ES[cleaned]

  const route = cleaned.match(/^(?:kanto-)?route-(\d+)$/i)
  if (route) return `Ruta ${route[1]}`

  return cleaned
    .split('-')
    .map((part) => LOCATION_ES[part] ?? capitalize(part))
    .join(' ')
}

export function formatMethod(name: string): string {
  return METHOD_ES[name] ?? capitalize(name.replace(/-/g, ' '))
}

export function capitalize(value: string): string {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function padDex(id: number): string {
  return String(id).padStart(3, '0')
}
