import { useCallback, useReducer } from 'react'
import type { VueId } from '../config/scene'

type Etape = { vue: VueId; verrou: boolean }

type Etat = Etape & {
  historique: Etape[]
}

type Action = { type: 'aller'; vue: VueId } | { type: 'retour' } | { type: 'verrou' }

function reducteur(etat: Etat, action: Action): Etat {
  switch (action.type) {
    case 'aller':
      if (action.vue === etat.vue) return etat
      return {
        vue: action.vue,
        verrou: false,
        historique: [...etat.historique, { vue: etat.vue, verrou: etat.verrou }],
      }

    case 'retour': {
      const precedente = etat.historique.at(-1)
      if (!precedente) return etat
      return { ...precedente, historique: etat.historique.slice(0, -1) }
    }

    case 'verrou':
      if (etat.vue !== 'ensemble') return etat
      return { ...etat, verrou: !etat.verrou }
  }
}

export function useNavigation() {
  const [etat, dispatch] = useReducer(reducteur, { vue: 'ensemble', verrou: false, historique: [] })

  const aller = useCallback((vue: VueId) => dispatch({ type: 'aller', vue }), [])
  const retour = useCallback(() => dispatch({ type: 'retour' }), [])
  const basculerVerrou = useCallback(() => dispatch({ type: 'verrou' }), [])

  return { vue: etat.vue, verrou: etat.verrou, aller, retour, basculerVerrou }
}
