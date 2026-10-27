import type { ComponentType } from 'react'

export type Appli = {
  titre: string
  Contenu: ComponentType
}

export const APPLIS = {} satisfies Record<string, Appli>

export type AppliId = keyof typeof APPLIS

// Fenêtres ouvertes au démarrage
export const AU_DEMARRAGE: AppliId[] = []

export const infosAppli = (id: AppliId): Appli => (APPLIS as Record<string, Appli>)[id]
