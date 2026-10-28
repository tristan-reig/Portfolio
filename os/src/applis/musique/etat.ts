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

// Lecture/pause depuis l'extérieur de la fenêtre (touche Espace) : le lecteur s'enregistre ici
let basculer: (() => void) | null = null

export function enregistrerBasculer(fonction: (() => void) | null) {
  basculer = fonction
}

// Renvoie false s'il n'y a pas de lecteur ouvert
export function basculerLecture() {
  if (!basculer) return false
  basculer()
  return true
}
