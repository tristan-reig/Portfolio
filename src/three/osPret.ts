import { useEffect, useState, useSyncExternalStore } from 'react'

let pret = false
const abonnes = new Set<() => void>()

export function signalerOsPret() {
  if (pret) return
  pret = true
  abonnes.forEach((a) => a())
}

const ATTENTE_MAX = 8000

export function useOsPret(demarrer: boolean) {
  const osPret = useSyncExternalStore(
    (rappel) => {
      abonnes.add(rappel)
      return () => abonnes.delete(rappel)
    },
    () => pret,
  )
  const [abandon, setAbandon] = useState(false)
  useEffect(() => {
    if (!demarrer || osPret) return
    const minuteur = setTimeout(() => setAbandon(true), ATTENTE_MAX)
    return () => clearTimeout(minuteur)
  }, [demarrer, osPret])
  return osPret || abandon
}
