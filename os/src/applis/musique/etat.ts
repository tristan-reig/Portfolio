import { useSyncExternalStore } from 'react'

// État de la musique partagé avec la barre (l'indicateur « en lecture »)
let enLecture = false
const abonnes = new Set<() => void>()

export function signalerLecture(valeur: boolean) {
  if (valeur === enLecture) return
  enLecture = valeur
  abonnes.forEach((a) => a())
}

export function useEnLecture() {
  return useSyncExternalStore(
    (rappel) => {
      abonnes.add(rappel)
      return () => abonnes.delete(rappel)
    },
    () => enLecture,
  )
}
