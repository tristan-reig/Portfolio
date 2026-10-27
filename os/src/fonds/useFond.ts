import { useState } from 'react'
import { FOND_PAR_DEFAUT, FONDS, type Fond } from './fonds'

const CLE = 'os-fond'

export function useFond() {
  const [fond, setFond] = useState<Fond>(() => {
    try {
      return FONDS.find((f) => f.id === localStorage.getItem(CLE)) ?? FOND_PAR_DEFAUT
    } catch {
      return FOND_PAR_DEFAUT
    }
  })

  const choisir = (f: Fond) => {
    setFond(f)
    try {
      localStorage.setItem(CLE, f.id)
    } catch {}
  }

  return [fond, choisir] as const
}
