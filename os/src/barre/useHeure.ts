import { useEffect, useState } from 'react'

// Heure courante, mise à jour à chaque changement de minute
export function useHeure() {
  const [maintenant, setMaintenant] = useState(() => new Date())

  useEffect(() => {
    let minuteur: number
    const planifier = () => {
      const d = new Date()
      const resteMinute = 60_000 - (d.getSeconds() * 1000 + d.getMilliseconds())
      minuteur = window.setTimeout(() => {
        setMaintenant(new Date())
        planifier()
      }, resteMinute)
    }
    planifier()
    return () => clearTimeout(minuteur)
  }, [])

  return maintenant
}
