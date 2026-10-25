import { useEffect, useRef } from 'react'

// Appelle action une seule fois, au premier clic, toucher ou appui sur une touche dans la page.
// C'est le seul moment où un navigateur autorise une page à démarrer le son.
export function usePremiereInteraction(action: () => void) {
  const actionRef = useRef(action)
  actionRef.current = action

  useEffect(() => {
    const evenements = ['pointerdown', 'keydown'] as const
    let fait = false

    const surInteraction = () => {
      if (fait) return
      fait = true
      retirer()
      actionRef.current()
    }
    const retirer = () => evenements.forEach((e) => window.removeEventListener(e, surInteraction, true))

    // capture : on passe avant les autres écouteurs, la scène reçoit quand même le clic ensuite
    evenements.forEach((e) => window.addEventListener(e, surInteraction, true))
    return retirer
  }, [])
}
