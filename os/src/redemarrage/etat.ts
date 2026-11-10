import { useSyncExternalStore } from 'react'

let enCours = false
const abonnes = new Set<() => void>()

function changer(valeur: boolean) {
  if (enCours === valeur) return
  enCours = valeur
  abonnes.forEach((f) => f())
}

export const redemarrer = () => changer(true)
export const finirRedemarrage = () => changer(false)

export function useRedemarrage() {
  return useSyncExternalStore(
    (f) => {
      abonnes.add(f)
      return () => abonnes.delete(f)
    },
    () => enCours,
  )
}
