import { useEffect, useState } from 'react'

// API Batterie du navigateur
type Batterie = EventTarget & { level: number; charging: boolean }
type NavigateurAvecBatterie = Navigator & { getBattery?: () => Promise<Batterie> }

export type EtatBatterie = { niveau: number; enCharge: boolean }

export function useBatterie() {
  const [etat, setEtat] = useState<EtatBatterie | null>(null)

  useEffect(() => {
    const navigateur = navigator as NavigateurAvecBatterie
    if (!navigateur.getBattery) return

    let batterie: Batterie | null = null
    let annule = false
    const lire = () => batterie && setEtat({ niveau: batterie.level, enCharge: batterie.charging })

    navigateur.getBattery().then((b) => {
      if (annule) return
      batterie = b
      lire()
      b.addEventListener('levelchange', lire)
      b.addEventListener('chargingchange', lire)
    }).catch(() => {})

    return () => {
      annule = true
      batterie?.removeEventListener('levelchange', lire)
      batterie?.removeEventListener('chargingchange', lire)
    }
  }, [])

  return etat
}
