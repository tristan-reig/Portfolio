import { fondActuel, modifier, useReglages } from '../reglages/reglages'
import type { Fond } from './fonds'

export function useFond() {
  const fond = fondActuel(useReglages())
  const choisir = (f: Fond) => modifier({ fond: f.id })
  return [fond, choisir] as const
}
