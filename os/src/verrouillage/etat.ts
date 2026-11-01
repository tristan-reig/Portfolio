import { useSyncExternalStore } from 'react'

let verrouille = false
const abonnes = new Set<() => void>()

function changer(valeur: boolean) {
  if (verrouille === valeur) return
  verrouille = valeur
  abonnes.forEach((f) => f())
}

export const verrouiller = () => changer(true)
export const deverrouiller = () => changer(false)
export const estVerrouille = () => verrouille

export function useVerrouille() {
  return useSyncExternalStore(
    (f) => {
      abonnes.add(f)
      return () => abonnes.delete(f)
    },
    () => verrouille,
  )
}
