import type { Gen1Type, NamedResource, TypeRelations } from '../types'
import { POKEMON_TYPES } from '../types'

function relationMultiplier(relations: TypeRelations, target: string, kind: 'from' | 'to'): number {
  const double = kind === 'from' ? relations.double_damage_from : relations.double_damage_to
  const half = kind === 'from' ? relations.half_damage_from : relations.half_damage_to
  const none = kind === 'from' ? relations.no_damage_from : relations.no_damage_to
  if (none.some((t) => t.name === target)) return 0
  if (double.some((t) => t.name === target)) return 2
  if (half.some((t) => t.name === target)) return 0.5
  return 1
}

export function defensiveMultiplier(
  attackingType: string,
  defenderTypes: string[],
  charts: Record<string, TypeRelations>,
): number {
  return defenderTypes.reduce((acc, def) => {
    const chart = charts[def]
    if (!chart) return acc
    return acc * relationMultiplier(chart, attackingType, 'from')
  }, 1)
}

export function offensiveMultiplier(
  attackerTypes: string[],
  defendingType: string,
  charts: Record<string, TypeRelations>,
): number {
  return Math.max(
    ...attackerTypes.map((atk) => {
      const chart = charts[atk]
      if (!chart) return 1
      return relationMultiplier(chart, defendingType, 'to')
    }),
  )
}

export function isGen1Type(name: string): name is Gen1Type {
  return (POKEMON_TYPES as readonly string[]).includes(name)
}

export function namesOf(list: NamedResource[]): string[] {
  return list.map((item) => item.name)
}
