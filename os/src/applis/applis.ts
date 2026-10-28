import type { ComponentType } from 'react'
import Musique from './musique/Musique'

export type Appli = {
  titre: string
  Contenu: ComponentType
}

export const APPLIS = {
  musique: { titre: 'Musique', Contenu: Musique },
} satisfies Record<string, Appli>

export type AppliId = keyof typeof APPLIS

// Fenêtres ouvertes au démarrage
export const AU_DEMARRAGE: AppliId[] = ['musique']

export const infosAppli = (id: AppliId): Appli => (APPLIS as Record<string, Appli>)[id]
