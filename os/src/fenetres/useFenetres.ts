import { useCallback, useState } from 'react'
import type { AppliId } from '../applis/applis'

export type Fenetre = {
  id: number
  appli: AppliId
  fermeture: boolean
}

const DUREE_FERMETURE = 180

let prochainId = 1

export function useFenetres(depart: AppliId[]) {
  const [fenetres, setFenetres] = useState<Fenetre[]>(() =>
    depart.map((appli) => ({ id: prochainId++, appli, fermeture: false })),
  )
  const [active, setActive] = useState<number | null>(() => fenetres.at(-1)?.id ?? null)

  const ouvrir = useCallback((appli: AppliId) => {
    const id = prochainId++
    setFenetres((f) => [...f, { id, appli, fermeture: false }])
    setActive(id)
  }, [])

  const fermer = useCallback((id: number) => {
    setFenetres((f) => f.map((x) => (x.id === id ? { ...x, fermeture: true } : x)))
    setTimeout(() => {
      setFenetres((f) => {
        const restantes = f.filter((x) => x.id !== id)
        setActive((a) => (a === id ? (restantes.filter((x) => !x.fermeture).at(-1)?.id ?? null) : a))
        return restantes
      })
    }, DUREE_FERMETURE)
  }, [])

  // Échange la place de deux fenêtres dans la mosaïque
  const echanger = useCallback((a: number, b: number) => {
    setFenetres((f) => {
      const i = f.findIndex((x) => x.id === a)
      const j = f.findIndex((x) => x.id === b)
      if (i < 0 || j < 0 || i === j) return f
      const suite = [...f]
      ;[suite[i], suite[j]] = [suite[j], suite[i]]
      return suite
    })
  }, [])

  return { fenetres, active, ouvrir, fermer, activer: setActive, echanger }
}
