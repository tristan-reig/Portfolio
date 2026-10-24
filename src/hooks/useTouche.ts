import { useEffect } from 'react'

// Déclenche une action quand une touche du clavier est pressée
export function useTouche(touche: string, action: () => void) {
  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === touche) action()
    }
    window.addEventListener('keydown', surTouche)
    return () => window.removeEventListener('keydown', surTouche)
  }, [touche, action])
}
