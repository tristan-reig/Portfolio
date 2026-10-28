import { useSyncExternalStore } from 'react'
import type { VueId } from '../config/scene'

let vue: VueId | null = null
const abonnes = new Set<() => void>()

export function signalerVueAtteinte(v: VueId | null) {
  if (v === vue) return
  vue = v
  abonnes.forEach((a) => a())
}

export function useVueAtteinte() {
  return useSyncExternalStore(
    (rappel) => {
      abonnes.add(rappel)
      return () => abonnes.delete(rappel)
    },
    () => vue,
  )
}
